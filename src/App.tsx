import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSoundEngine } from "./components/SoundManager";
import { ParticleSystem } from "./components/ParticleSystem";
import { DialogSystem } from "./components/DialogSystem";
import { TerrainCell } from "./components/TerrainCell";
import { ClassSprite, EnemySprite } from "./components/Sprites";
import {
  ItemIcon,
  ChestIcon,
  StairsIcon,
  PortalIcon,
  BrazierIcon,
  LoreIcon,
  NpcIcon,
} from "./components/Icons";
import {
  C,
  SERIF,
  MONO,
  GRID_SIZE,
  VIEW_RADIUS,
  CLASSES,
  FLOOR_META,
  LORE_FRAGMENTS,
  TRAILER_SLIDES,
  ENEMY_TABLE,
  STAT_ITEMS,
  CONSUMABLES,
  GOLD_ITEM,
  KEY_ITEM,
  RELICS,
  FLOOR_AFFIXES,
} from "./constants";
import { PlayerStats, Enemy, Item, Npc, MapData } from "./types";
import {
  Sword,
  Shield,
  Heart,
  Package,
  FlaskConical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Key,
  Coins,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Compass,
  User,
  ExternalLink,
  Zap,
} from "lucide-react";

// Helper to pick randomized elements
function rand(n: number) {
  return Math.floor(Math.random() * n);
}
function randRange(lo: number, hi: number) {
  return lo + rand(hi - lo + 1);
}
function key(x: number, y: number) {
  return `${x},${y}`;
}
function pick<T>(arr: T[]): T {
  return arr[rand(arr.length)];
}

function findPath(start: [number, number], target: [number, number], grid: string[][]): [number, number][] | null {
  const [sx, sy] = start;
  const [tx, ty] = target;
  if (sx === tx && sy === ty) return [];
  
  const queue: [number, number][] = [[sx, sy]];
  const parent: Record<string, string> = {};
  const visited = new Set<string>();
  visited.add(`${sx},${sy}`);
  
  const dirs = [
    [0, -1],  // Up
    [0, 1],   // Down
    [-1, 0],  // Left
    [1, 0]    // Right
  ];
  
  let found = false;
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    if (cx === tx && cy === ty) {
      found = true;
      break;
    }
    
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && ny >= 0 && nx < grid[0].length && ny < grid.length) {
        const tile = grid[ny][nx];
        if (tile !== "wall" && tile !== "cracked-wall") {
          const keyStr = `${nx},${ny}`;
          if (!visited.has(keyStr)) {
            visited.add(keyStr);
            parent[keyStr] = `${cx},${cy}`;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }
  
  if (!found) return null;
  
  const path: [number, number][] = [];
  let curr = `${tx},${ty}`;
  while (curr !== `${sx},${sy}`) {
    const [cx, cy] = curr.split(",").map(Number);
    path.push([cx, cy]);
    curr = parent[curr];
  }
  return path.reverse();
}

export default function AshveilRPG() {
  const sound = useSoundEngine();
  const [muted, setMutedState] = useState(false);
  const [stage, setStage] = useState("title"); // title | trailer | select | intro | game
  const [trailerIndex, setTrailerIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const [floor, setFloor] = useState(1);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [combat, setCombat] = useState<{ enemyKey: string; enemy: Enemy } | null>(null);
  const [screen, setScreen] = useState("explore"); // explore | shop | combat | gameover | victory
  const [actionMenu, setActionMenu] = useState("main"); // main | skills | items
  const [playerAnim, setPlayerAnim] = useState("idle");
  const [enemyAnim, setEnemyAnim] = useState("idle");
  const [shake, setShake] = useState(false);
  const [playerShield, setPlayerShield] = useState(0);
  const [firstStrike, setFirstStrike] = useState(true);
  const [inSecret, setInSecret] = useState(false);
  const [transition, setTransition] = useState<{ label: string; icon: string } | null>(null);

  // NPC dialogue overlay trigger state
  const [activeNpc, setActiveNpc] = useState<Npc | null>(null);
  const [activeNpcKey, setActiveNpcKey] = useState<string | null>(null);

  // Expanded RPG Character Customization States
  const [customTrait, setCustomTrait] = useState<"scavenger" | "acolyte" | "ward" | "slayer">("scavenger");
  const [customAtk, setCustomAtk] = useState(0);
  const [customDef, setCustomDef] = useState(0);
  const [customHp, setCustomHp] = useState(0);
  const [customPoints, setCustomPoints] = useState(3);

  // Journal (unlocked lore entries to build world depth)
  const [unlockedLore, setUnlockedLore] = useState<string[]>([]);

  // Batch 1 Enhancement states
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; color: string; isEnemy: boolean; crit?: boolean }[]>([]);
  const [torchFuel, setTorchFuel] = useState<number>(100);
  const [adrenaline, setAdrenaline] = useState<number>(0);
  const [activeLevelUpChoice, setActiveLevelUpChoice] = useState<{ level: number; hpGain: number; atkGain: number; defGain: number } | null>(null);
  const [activeLoreCodex, setActiveLoreCodex] = useState<{ title: string; content: string } | null>(null);

  // Status Effects (Turns Remaining)
  const [playerBleeding, setPlayerBleeding] = useState(0);
  const [playerEnergized, setPlayerEnergized] = useState(0);
  const [enemyBleeding, setEnemyBleeding] = useState(0);
  const [enemyStunned, setEnemyStunned] = useState(0);

  // Active Combat Enemy Intent
  const [enemyIntent, setEnemyIntent] = useState<{ name: string; desc: string; type: "attack" | "debuff" | "block" | "spell"; icon: string } | null>(null);

  // Mobile layout active tab state
  const [mobileTab, setMobileTab] = useState("map"); // map | status | inventory

  // Batch 2 Enhancement states
  const [equippedRelics, setEquippedRelics] = useState<Item[]>([]);
  const [floorAffix, setFloorAffix] = useState<{ name: string; desc: string; icon: string } | null>(null);
  const [activeShrine, setActiveShrine] = useState<{ name: string; desc: string; options: { text: string; action: () => void }[] } | null>(null);

  // Touch-to-move, 3D Diorama, and Combat Intro states
  const [threeDEnabled, setThreeDEnabled] = useState(true);
  const [pathQueue, setPathQueue] = useState<[number, number][]>([]);
  const [combatIntro, setCombatIntro] = useState(false);

  // "The Chronicle of Ash" - Active Run Conquest Statistics
  const [statsKills, setStatsKills] = useState(0);
  const [statsSteps, setStatsSteps] = useState(0);
  const [statsSecretRooms, setStatsSecretRooms] = useState(0);
  const [statsShrines, setStatsShrines] = useState(0);
  const [statsGoldSpent, setStatsGoldSpent] = useState(0);
  const [statsPotionsDrunk, setStatsPotionsDrunk] = useState(0);

  const logRef = useRef<HTMLDivElement>(null);
  const cls = selectedClass ? CLASSES[selectedClass] : null;

  const pushLog = useCallback((msg: string) => {
    setLog((l) => [...l.slice(-30), msg]);
  }, []);

  const addDamageNumber = useCallback((text: string, color: string, isEnemy: boolean, crit?: boolean) => {
    const id = Math.random();
    setDamageNumbers((prev) => [...prev, { id, text, color, isEnemy, crit }]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((dn) => dn.id !== id));
    }, 1200);
  }, []);

  // Scroll logs to the bottom on fresh messages
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const fireTransition = useCallback((label: string, icon: string, duration = 800) => {
    setTransition({ label, icon });
    setTimeout(() => setTransition(null), duration);
  }, []);

  const reveal = useCallback((px: number, py: number) => {
    setVisited((prev) => {
      const next = new Set(prev);
      for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++) {
        for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) {
            next.add(key(nx, ny));
          }
        }
      }
      return next;
    });
  }, []);

  const doShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 260);
  }, []);

  const MOODS: Record<number, [string[], number]> = {
    1: [["C3", "Eb3", "G3"], 64],
    2: [["D3", "F3", "Ab3"], 72],
    3: [["C3", "Db3", "Gb3"], 58],
  };

  // Generate a procedural floor plan
  const generateFloor = useCallback((lvl: number): MapData => {
    const size = GRID_SIZE;
    const grid = Array.from({ length: size }, () => Array(size).fill("wall"));
    let cx = Math.floor(size / 2);
    let cy = Math.floor(size / 2);
    grid[cy][cx] = "floor";

    // Random walk procedural carving
    for (let i = 0; i < 150; i++) {
      const dir = rand(4);
      if (dir === 0) cx = Math.min(size - 2, cx + 1);
      else if (dir === 1) cx = Math.max(1, cx - 1);
      else if (dir === 2) cy = Math.min(size - 2, cy + 1);
      else cy = Math.max(1, cy - 1);
      grid[cy][cx] = "floor";
    }

    const floorCells: [number, number][] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] === "floor") floorCells.push([x, y]);
      }
    }

    const startPos: [number, number] = [Math.floor(size / 2), Math.floor(size / 2)];
    const away = (c: [number, number]) => Math.abs(c[0] - startPos[0]) + Math.abs(c[1] - startPos[1]);
    const sorted = [...floorCells].sort((a, b) => away(b) - away(a));
    const stairsPos = sorted[0];
    grid[stairsPos[1]][stairsPos[0]] = "stairs";

    const usable = sorted.slice(1).filter((c) => away(c) > 2);
    const takeSpot = () => {
      for (let t = 0; t < 50; t++) {
        const c = usable[rand(usable.length)];
        if (grid[c[1]][c[0]] === "floor") return c;
      }
      return null;
    };

    // Spawn enemies
    const enemyData: Record<string, Enemy> = {};
    const pool = ENEMY_TABLE[lvl];
    const enemyCount = lvl === 3 ? 1 : 4 + lvl;
    for (let i = 0; i < enemyCount; i++) {
      const c = takeSpot();
      if (!c) continue;
      const e = { ...pick(pool) };
      e.curHp = e.hp;
      grid[c[1]][c[0]] = "enemy";
      enemyData[key(c[0], c[1])] = e;
    }

    if (lvl === 3) {
      grid[stairsPos[1]][stairsPos[0]] = "enemy";
      const boss = { ...pool[0] };
      boss.curHp = boss.hp;
      enemyData[key(stairsPos[0], stairsPos[1])] = boss;
    }

    // Spawn items
    const itemData: Record<string, Item> = {};
    for (let i = 0; i < 3; i++) {
      const c = takeSpot();
      if (!c) continue;
      const roll = rand(10);
      const item =
        roll < 3
          ? pick(CONSUMABLES)
          : roll < 5
          ? pick(STAT_ITEMS)
          : roll < 7
          ? GOLD_ITEM
          : KEY_ITEM;
      grid[c[1]][c[0]] = "item";
      itemData[key(c[0], c[1])] = item;
    }

    // Spawn locked chest
    const chestData: Record<string, { opened: boolean }> = {};
    const c0 = takeSpot();
    if (c0) {
      grid[c0[1]][c0[0]] = "chest";
      chestData[key(c0[0], c0[1])] = { opened: false };
    }

    // Spawn Lore Ledger
    const npcData: Record<string, Npc> = {};
    const cl = takeSpot();
    if (cl) {
      grid[cl[1]][cl[0]] = "lore";
      npcData[key(cl[0], cl[1])] = { kind: "lore", name: "Dusty Codex", dialogueStep: 0 };
    }

    // Spawn rich Interactive NPCs
    if (lvl === 1) {
      const c2 = takeSpot();
      if (c2) {
        grid[c2[1]][c2[0]] = "npc";
        npcData[key(c2[0], c2[1])] = { kind: "soldier", name: "Robert the Weary", dialogueStep: 0 };
      }
      const c3 = takeSpot();
      if (c3) {
        grid[c3[1]][c3[0]] = "npc";
        npcData[key(c3[0], c3[1])] = { kind: "ghost", name: "Sorrowful Lilly", dialogueStep: 0 };
      }
    } else if (lvl === 2) {
      const c2 = takeSpot();
      if (c2) {
        grid[c2[1]][c2[0]] = "npc";
        npcData[key(c2[0], c2[1])] = { kind: "prisoner", name: "Scribe Vaelen", dialogueStep: 0 };
      }
      const c3 = takeSpot();
      if (c3) {
        grid[c3[1]][c3[0]] = "npc";
        npcData[key(c3[0], c3[1])] = { kind: "bard", name: "Mournful Alistair", dialogueStep: 0 };
      }
    }

    // Spawn merchant
    const cm = takeSpot();
    if (cm) {
      grid[cm[1]][cm[0]] = "merchant";
      npcData[key(cm[0], cm[1])] = { kind: "merchant", name: "Gideon the Scavenger", dialogueStep: 0 };
    }

    // Spawn ancestral Shrines (Batch 2)
    const cs = takeSpot();
    if (cs) {
      grid[cs[1]][cs[0]] = "shrine";
    }

    // Spawn dangerous floor traps (Batch 2)
    for (let i = 0; i < (lvl === 3 ? 1 : 3); i++) {
      const ct = takeSpot();
      if (ct) {
        grid[ct[1]][ct[0]] = "trap";
      }
    }

    // Find and convert potential cracked wall tiles (Batch 2)
    const potentialCracked: [number, number][] = [];
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] === "wall") {
          const hasFloorAdj =
            grid[y - 1][x] === "floor" ||
            grid[y + 1][x] === "floor" ||
            grid[y][x - 1] === "floor" ||
            grid[y][x + 1] === "floor";
          if (hasFloorAdj) {
            potentialCracked.push([x, y]);
          }
        }
      }
    }
    if (potentialCracked.length > 0) {
      const cw1 = potentialCracked[rand(potentialCracked.length)];
      grid[cw1[1]][cw1[0]] = "cracked-wall";
      if (potentialCracked.length > 2 && rand(2) === 0) {
        const cw2 = potentialCracked[rand(potentialCracked.length)];
        if (cw2[0] !== cw1[0] || cw2[1] !== cw1[1]) {
          grid[cw2[1]][cw2[0]] = "cracked-wall";
        }
      }
    }

    // Spawn background braziers
    for (let i = 0; i < 3; i++) {
      const c = takeSpot();
      if (c && grid[c[1]][c[0]] === "floor") {
        grid[c[1]][c[0]] = "brazier";
      }
    }

    // Spawn blue secret portals
    const cp = takeSpot();
    if (cp) {
      grid[cp[1]][cp[0]] = "portal";
    }

    // Create the pocket secret room
    const secretItem = rand(2) === 0 ? { ...pick(STAT_ITEMS) } : { ...GOLD_ITEM, amt: 35 };
    const secretGrid = Array.from({ length: 5 }, () => Array(5).fill("floor"));
    for (let x = 0; x < 5; x++) {
      secretGrid[0][x] = "wall";
      secretGrid[4][x] = "wall";
    }
    for (let y = 0; y < 5; y++) {
      secretGrid[y][0] = "wall";
      secretGrid[y][4] = "wall";
    }
    secretGrid[2][3] = "secret-item";
    secretGrid[2][1] = "portal-back";
    const secretRoom = {
      grid: secretGrid,
      item: secretItem,
      entryPos: [1, 2] as [number, number],
      itemPos: [3, 2] as [number, number],
    };

    return {
      grid,
      enemyData,
      itemData,
      chestData,
      npcData,
      startPos,
      secretRoom,
      savedPos: null,
    };
  }, []);

  const startFloor = useCallback((n: number) => {
    const data = generateFloor(n);
    setMapData(data);
    setPos(data.startPos);
    setVisited(new Set());
    setFloor(n);
    setTimeout(() => reveal(data.startPos[0], data.startPos[1]), 0);

    // Roll custom floor affix!
    const affix = pick(FLOOR_AFFIXES);
    setFloorAffix(affix);

    pushLog(`— ${FLOOR_META[n].name} —`);
    pushLog(FLOOR_META[n].intro);
    pushLog(`🌀 FLOOR AFFIX: [${affix.name}] - ${affix.desc}`);
    sound.setMood(MOODS[n][0], MOODS[n][1]);
  }, [reveal, pushLog, sound, generateFloor]);

  const beginFromTitle = useCallback(async () => {
    await sound.ensureInit();
    sound.setMood(["C3", "Eb3", "Bb2"], 52);
    setTrailerIndex(0);
    setStage("trailer");
  }, [sound]);

  const skipTrailer = useCallback(() => {
    setStage("select");
  }, []);

  // Progress the lore slides
  useEffect(() => {
    if (stage !== "trailer") return;
    if (trailerIndex >= TRAILER_SLIDES.length - 1) return;
    const t = setTimeout(() => setTrailerIndex((i) => i + 1), 3200);
    return () => clearTimeout(t);
  }, [stage, trailerIndex]);

  const chooseClass = useCallback(async (k: string) => {
    setSelectedClass(k);
    await sound.ensureInit();
    sound.setMood(MOODS[1][0], MOODS[1][1]);
    setStage("intro");
  }, [sound]);

  const beginGame = useCallback(() => {
    if (!selectedClass) return;
    const baseStats = CLASSES[selectedClass].base;

    // Calculate customization adjustments
    let startHp = baseStats.hp + customHp;
    let startMaxHp = baseStats.maxHp + customHp;
    let startAtk = baseStats.atk + customAtk;
    let startDef = baseStats.def + customDef;
    let startGold = 0;
    let startFocus = 1;
    let startFocusMax = baseStats.focusMax;
    const startingInventory: Item[] = [];

    // Apply starting traits
    if (customTrait === "scavenger") {
      startGold = 25;
      startingInventory.push({ name: "Health Elixir", type: "potion", heal: 18, icon: "🧪" });
    } else if (customTrait === "acolyte") {
      startMaxHp += 5;
      startHp += 5;
      startFocusMax += 1;
      startFocus = startFocusMax;
    } else if (customTrait === "ward") {
      startDef += 2;
    } else if (customTrait === "slayer") {
      startAtk += 2;
    }

    setStats({
      level: 1,
      xp: 0,
      xpToNext: 22,
      hp: startHp,
      maxHp: startMaxHp,
      atk: startAtk,
      def: startDef,
      gold: startGold,
      focus: startFocus,
      focusMax: startFocusMax,
    });
    setInventory(startingInventory);

    setStage("game");
    const data = generateFloor(1);
    setMapData(data);
    setPos(data.startPos);
    setVisited(new Set());
    setFloor(1);
    setUnlockedLore([]);
    setStatsKills(0);
    setStatsSteps(0);
    setStatsSecretRooms(0);
    setStatsShrines(0);
    setStatsGoldSpent(0);
    setStatsPotionsDrunk(0);
    setTimeout(() => reveal(data.startPos[0], data.startPos[1]), 0);
    setLog([
      `— ${FLOOR_META[1].name} —`, 
      FLOOR_META[1].intro,
      `🎭 Custom Vanguard initialized: ${customTrait.toUpperCase()} style.`,
    ]);
  }, [selectedClass, reveal, generateFloor, customTrait, customAtk, customDef, customHp]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      sound.setMuted(!m);
      return !m;
    });
  }, [sound]);

  const tryLevelUp = useCallback((s: PlayerStats) => {
    let { hp, maxHp, atk, def, level, xp, xpToNext, gold, focus, focusMax } = s;
    let leveled = false;
    let totalHpGain = 0;
    let totalAtkGain = 0;
    let totalDefGain = 0;
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      maxHp += 8;
      atk += 2;
      def += 1;
      hp = maxHp;
      leveled = true;
      totalHpGain += 8;
      totalAtkGain += 2;
      totalDefGain += 1;
      xpToNext = Math.floor(xpToNext * 1.45);
      pushLog(`⬆ LEVEL UP! You are now Level ${level}. Your steel sharpens.`);
    }
    if (leveled) {
      sound.sfx.levelup();
      setActiveLevelUpChoice({
        level,
        hpGain: totalHpGain,
        atkGain: totalAtkGain,
        defGain: totalDefGain,
      });
    }
    return { level, xp, xpToNext, hp, maxHp, atk, def, gold, focus, focusMax };
  }, [pushLog, sound]);

  const grantItem = useCallback((item: Item) => {
    sound.sfx.pickup();
    if (item.type === "potion" || item.type === "scroll" || item.type === "focus") {
      setInventory((inv) => [...inv, item]);
      pushLog(`Placed a [${item.name}] into your satchel.`);
    } else if (item.type === "atk") {
      setStats((s) => s ? { ...s, atk: s.atk + (item.amt || 0) } : null);
      pushLog(`Equipped ${item.name}. permanent ATK +${item.amt}.`);
    } else if (item.type === "def") {
      setStats((s) => s ? { ...s, def: s.def + (item.amt || 0) } : null);
      pushLog(`Equipped ${item.name}. permanent DEF +${item.amt}.`);
    } else if (item.type === "maxhp") {
      setStats((s) => s ? { ...s, maxHp: s.maxHp + (item.amt || 0), hp: s.hp + (item.amt || 0) } : null);
      pushLog(`Absorbed ${item.name}. permanent Max HP +${item.amt}.`);
    } else if (item.type === "gold") {
      setStats((s) => s ? { ...s, gold: s.gold + (item.amt || 0) } : null);
      pushLog(`Acquired heavy pouch. +${item.amt} Gold coins.`);
    } else if (item.type === "key") {
      setKeyCount((k) => k + 1);
      pushLog("Picked up a cold iron Brass Key.");
    }
  }, [pushLog, sound]);

  // ---------- Exploration movement & Triggers ----------
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (screen !== "explore" || inSecret || !mapData || activeNpc) return;
    const [x, y] = pos;
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return;

    const tile = mapData.grid[ny][nx];
    if (tile === "wall") return;
    if (tile === "cracked-wall") {
      sound.sfx.attack();
      doShake();
      pushLog("💥 You strike the hollow stone! The illusionary wall crumbles, revealing a hidden chest!");
      setMapData((md: any) => {
        const g = md.grid.map((r: any) => r.slice());
        g[ny][nx] = "chest";
        const nc = { ...md.chestData };
        nc[key(nx, ny)] = { opened: false };
        return { ...md, grid: g, chestData: nc };
      });
      return;
    }
    const k = key(nx, ny);

    // Battle trigger check
    if (tile === "enemy") {
      const enemy = mapData.enemyData[k];
      if (enemy && enemy.curHp > 0) {
        setCombat({ enemyKey: k, enemy: { ...enemy } });
        setScreen("combat");
        setEnemyAnim("idle");
        setActionMenu("main");
        setFirstStrike(true);
        if (equippedRelics.some((r) => r.name === "Gilded Hourglass")) {
          setAdrenaline(25);
          pushLog("⏳ Gilded Hourglass hums, accelerating your timeline! You enter combat with 25 Adrenaline.");
        }
        if (enemy.boss) {
          doShake();
          pushLog(`👑 The shadow of the Hollow King stands in the light!`);
          pushLog("King Aldric: 'Your eyes hold the spark of the living. It will freeze just like hers.'");
        } else {
          pushLog(`⚔️ A wild ${enemy.name} lunges from the dark!`);
        }
        return;
      }
    }

    sound.sfx.step();
    setPlayerAnim("walk");
    setTimeout(() => setPlayerAnim("idle"), 220);
    setPos([nx, ny]);
    reveal(nx, ny);
    setStatsSteps((s) => s + 1);

    // Decrease Torch Fuel (Batch 2)
    setTorchFuel((f) => {
      const hasEmber = equippedRelics.some((r) => r.name === "Eternal Ember");
      const baseDrain = hasEmber ? 1 : 2;
      const finalDrain = floorAffix?.name === "Ashen Chill" ? baseDrain * 1.5 : baseDrain;
      const nextFuel = Math.max(0, f - finalDrain);
      if (nextFuel === 0 && f > 0) {
        pushLog("⚠️ YOUR TORCH IS EXTINGUISHED! Suffer Grave Darkness debuff (-30% combat damage, +20% damage taken, cannot flee)!");
      }
      return nextFuel;
    });

    // Void Heart Relic passive heal on move (Batch 2)
    if (equippedRelics.some((r) => r.name === "Void Heart")) {
      setStats((s) => s ? { ...s, hp: Math.min(s.maxHp, s.hp + 1) } : null);
    }

    // Evaluate special action tiles
    if (tile === "item") {
      const item = mapData.itemData[k];
      if (item) {
        grantItem(item);
        setMapData((md: any) => {
          const g = md.grid.map((r: any) => r.slice());
          g[ny][nx] = "floor";
          const ni = { ...md.itemData };
          delete ni[k];
          return { ...md, grid: g, itemData: ni };
        });
      }
    } else if (tile === "chest") {
      const chest = mapData.chestData[k];
      if (chest && !chest.opened) {
        if (keyCount > 0) {
          setKeyCount((kc) => kc - 1);
          const reward = rand(3) === 0 ? GOLD_ITEM : rand(2) === 0 ? pick(CONSUMABLES) : pick(STAT_ITEMS);
          pushLog("🗝️ You slide the brass key into the lock. The chest opens.");
          grantItem(reward.amt ? { ...reward, amt: reward.amt * 2 } : reward);
          setMapData((md: any) => {
            const g = md.grid.map((r: any) => r.slice());
            g[ny][nx] = "floor";
            const nc = { ...md.chestData };
            delete nc[k];
            return { ...md, grid: g, chestData: nc };
          });
        } else {
          pushLog("🔒 This chest is bound by a heavy lock. You need a key to open it.");
        }
      }
    } else if (tile === "shrine") {
      sound.sfx.heal();
      doShake();
      setStatsShrines((sh) => sh + 1);
      const shrineIndex = rand(3);
      if (shrineIndex === 0) {
        setActiveShrine({
          name: "Grave of the Fallen Vanguard",
          desc: "A snow-covered monolith decorated with old weapons. A cold voice whispers from the dirt.",
          options: [
            {
              text: "🛐 Kneel & Pray (Restore full HP & Focus, but permanently lose 5 Max HP)",
              action: () => {
                setStats((s) => s ? { ...s, maxHp: Math.max(10, s.maxHp - 5), hp: Math.max(10, s.maxHp - 5), focus: s.focusMax } : null);
                pushLog("🛐 You pray for the fallen. A chilly blessing heals your flesh but drains your vitality. Full HP & Focus restored. Max HP -5.");
                sound.sfx.heal();
                setActiveShrine(null);
              }
            },
            {
              text: "🔨 Shatter the Gravestone (Scavenge a rare item but receive a heavy Bleed)",
              action: () => {
                const item = pick(STAT_ITEMS);
                grantItem(item);
                setPlayerBleeding((b) => b + 3);
                pushLog(`🔨 You smash the stone marker! You find a [${item.name}] but trigger a curse. You are BLEEDING (3 turns)!`);
                sound.sfx.attack();
                setActiveShrine(null);
              }
            },
            {
              text: "🚶 Walk away in silence",
              action: () => {
                pushLog("You leave the grave undisturbed.");
                setActiveShrine(null);
              }
            }
          ]
        });
      } else if (shrineIndex === 1) {
        setActiveShrine({
          name: "Chalice of Crimson Ash",
          desc: "A pedestal holding a silver chalice filled with glowing hot ash. It radiates raw power.",
          options: [
            {
              text: "🍷 Drink Deeply (+3 permanent ATK, but suffer 10 HP damage)",
              action: () => {
                setStats((s) => s ? { ...s, atk: s.atk + 3, hp: Math.max(1, s.hp - 10) } : null);
                pushLog("🍷 You drink the burning ash. Liquid fire surges through your veins! Permanent ATK +3. Suffer -10 HP damage.");
                sound.sfx.attack();
                doShake();
                setActiveShrine(null);
              }
            },
            {
              text: "💧 Pour water from your pouch (Spend 10 Gold for +35% Torch Fuel & +1 Key)",
              action: () => {
                setStats((s) => {
                  if (!s) return null;
                  if (s.gold < 10) {
                    pushLog("❌ You don't have 10 gold coins to offer.");
                    return s;
                  }
                  setTorchFuel((f) => Math.min(100, f + 35));
                  setKeyCount((k) => k + 1);
                  setStatsGoldSpent((g) => g + 10);
                  pushLog("💧 You extinguish the burning ashes. The vapor flares and reveals a hidden brass key! +35% Torch Fuel, +1 Key.");
                  return { ...s, gold: s.gold - 10 };
                });
                setActiveShrine(null);
              }
            },
            {
              text: "🚶 Walk away in silence",
              action: () => {
                pushLog("You leave the chalice burning.");
                setActiveShrine(null);
              }
            }
          ]
        });
      } else {
        setActiveShrine({
          name: "The Whispering Obelisk",
          desc: "A black obsidian column covered in glowing blue glyphs. It hums with spiritual energy.",
          options: [
            {
              text: "🔷 Offer a Focus Gem (Lose 1 Focus Max permanently for +20 permanent Max HP)",
              action: () => {
                setStats((s) => {
                  if (!s) return null;
                  if (s.focusMax <= 1) {
                    pushLog("❌ Your spiritual link is too weak to sacrifice focus.");
                    return s;
                  }
                  return { ...s, focusMax: s.focusMax - 1, focus: Math.min(s.focus, s.focusMax - 1), maxHp: s.maxHp + 20, hp: s.hp + 20 };
                });
                pushLog("🔷 You sacrifice a focus gem slot. A wave of raw life force bolsters your frame. Max HP +20, Max Focus -1.");
                sound.sfx.heal();
                setActiveShrine(null);
              }
            },
            {
              text: "📜 Decipher the Runes (Decipher lore fragment and gain Scroll of Void Powder)",
              action: () => {
                const fragment = pick(LORE_FRAGMENTS[floor]);
                pushLog(`📜 Deciphered obelisk runes: "${fragment}"`);
                setUnlockedLore((prev) => [...prev, fragment]);
                grantItem({ name: "Void Powder", type: "scroll", dmg: 40, icon: "🌫️" });
                setActiveShrine(null);
              }
            },
            {
              text: "🚶 Walk away in silence",
              action: () => {
                pushLog("You leave the runes unread.");
                setActiveShrine(null);
              }
            }
          ]
        });
      }
      setMapData((md: any) => {
        const g = md.grid.map((r: any) => r.slice());
        g[ny][nx] = "floor";
        return { ...md, grid: g };
      });
    } else if (tile === "trap") {
      sound.sfx.attack();
      doShake();
      const dmg = Math.max(2, 6 - (stats?.def || 0));
      setStats((s) => s ? { ...s, hp: Math.max(1, s.hp - dmg) } : null);
      setPlayerBleeding((b) => b + 2);
      addDamageNumber(`-${dmg} HP`, C.bloodBright, false);
      pushLog(`⚠️ CLICK! You triggered a hidden iron spike trap! You take ${dmg} damage and are BLEEDING (2 turns).`);
      setMapData((md: any) => {
        const g = md.grid.map((r: any) => r.slice());
        g[ny][nx] = "floor";
        return { ...md, grid: g };
      });
    } else if (tile === "lore") {
      const fragment = pick(LORE_FRAGMENTS[floor]);
      pushLog(`📜 Fragment: "${fragment}"`);
      setUnlockedLore((prev) => [...prev, fragment]);
      setMapData((md: any) => {
        const g = md.grid.map((r: any) => r.slice());
        g[ny][nx] = "floor";
        return { ...md, grid: g };
      });
    } else if (tile === "npc") {
      const npc = mapData.npcData[k];
      if (npc) {
        setActiveNpc(npc);
        setActiveNpcKey(k);
        pushLog(`💬 You step forward to speak with ${npc.name}.`);
      }
    } else if (tile === "merchant") {
      setScreen("shop");
      pushLog("⚖️ Gideon: 'Gold is just yellow ash here. But it buys my steel.'");
    } else if (tile === "portal") {
      fireTransition("Entering the rift...", "🌀", 800);
      sound.sfx.portal();
      setStatsSecretRooms((sr) => sr + 1);
      setTimeout(() => {
        setMapData((md: any) => ({ ...md, savedPos: [nx, ny] }));
        setInSecret(true);
        setPos(mapData.secretRoom.entryPos);
      }, 400);
    } else if (tile === "stairs") {
      if (floor < 3) {
        fireTransition(`Climbing to ${FLOOR_META[floor + 1].name}...`, "🕯️", 900);
        sound.sfx.portal();
        setTimeout(() => {
          pushLog(`You climb deeper toward the castle spire.`);
          startFloor(floor + 1);
        }, 600);
      }
    }
  }, [
    screen,
    inSecret,
    pos,
    mapData,
    reveal,
    grantItem,
    floor,
    startFloor,
    pushLog,
    keyCount,
    doShake,
    sound,
    fireTransition,
    activeNpc,
  ]);

  const moveInSecret = useCallback((dx: number, dy: number) => {
    if (!inSecret || !mapData) return;
    const [x, y] = pos;
    const nx = x + dx;
    const ny = y + dy;
    const sg = mapData.secretRoom.grid;
    if (nx < 0 || ny < 0 || nx >= sg[0].length || ny >= sg.length) return;

    const tile = sg[ny][nx];
    if (tile === "wall") return;

    sound.sfx.step();
    setPlayerAnim("walk");
    setTimeout(() => setPlayerAnim("idle"), 220);
    setPos([nx, ny]);
    setStatsSteps((s) => s + 1);

    if (tile === "secret-item") {
      grantItem(mapData.secretRoom.item);
      setMapData((md: any) => {
        const g2 = md.secretRoom.grid.map((r: any) => r.slice());
        g2[ny][nx] = "floor";
        return { ...md, secretRoom: { ...md.secretRoom, grid: g2 } };
      });
    } else if (tile === "portal-back") {
      fireTransition("Fleeing the rift...", "🌀", 700);
      sound.sfx.portal();
      setTimeout(() => {
        setInSecret(false);
        setPos(mapData.savedPos || mapData.startPos);
      }, 400);
    }
  }, [inSecret, mapData, pos, grantItem, sound, fireTransition]);

  // Bind keyboard navigation keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (stage !== "game" || screen !== "explore" || activeNpc) return;
      const fn = inSecret ? moveInSecret : movePlayer;
      let moved = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { fn(0, -1); moved = true; }
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { fn(0, 1); moved = true; }
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { fn(-1, 0); moved = true; }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { fn(1, 0); moved = true; }
      
      if (moved) {
        setPathQueue([]); // Clear automated finger path movement when player keys are pressed manually
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [movePlayer, moveInSecret, screen, inSecret, stage, activeNpc]);

  // Touch-to-move click handler
  const handleTileClick = useCallback((tx: number, ty: number) => {
    if (stage !== "game" || screen !== "explore" || activeNpc || combat) return;
    const [sx, sy] = pos;
    if (sx === tx && sy === ty) return;

    const grid = inSecret ? mapData?.secretRoom.grid : mapData?.grid;
    if (!grid) return;

    // Check if target cell itself is not solid wall
    if (grid[ty]?.[tx] === "wall") return;

    const path = findPath(pos, [tx, ty], grid);
    if (path) {
      setPathQueue(path);
    }
  }, [stage, screen, activeNpc, combat, pos, inSecret, mapData]);

  // Auto path walking runner
  useEffect(() => {
    if (pathQueue.length === 0 || screen !== "explore" || combat || activeNpc || stage !== "game") return;

    const timer = setTimeout(() => {
      const nextStep = pathQueue[0];
      const [nx, ny] = nextStep;
      const [cx, cy] = pos;
      const dx = nx - cx;
      const dy = ny - cy;

      if (Math.abs(dx) + Math.abs(dy) === 1) {
        if (inSecret) {
          moveInSecret(dx, dy);
        } else {
          movePlayer(dx, dy);
        }
      }
      setPathQueue((prev) => prev.slice(1));
    }, 160);

    return () => clearTimeout(timer);
  }, [pathQueue, pos, screen, combat, activeNpc, stage, inSecret, movePlayer, moveInSecret]);

  // Combat intro walk-in cinematic timer
  useEffect(() => {
    if (screen === "combat") {
      setCombatIntro(true);
      const timer = setTimeout(() => setCombatIntro(false), 800);
      return () => clearTimeout(timer);
    } else {
      setCombatIntro(false);
    }
  }, [screen]);

  // -  // ---------- Active Monster Intent Rolling ----------
  const rollEnemyIntent = useCallback((enemyName: string) => {
    const r = Math.random();
    if (enemyName === "Rat Wretch") {
      if (r < 0.6) setEnemyIntent({ name: "🧀 Nibble Strike", desc: "A rapid physical bite.", type: "attack", icon: "🐀" });
      else setEnemyIntent({ name: "🛡️ Scurry Guard", desc: "Ready to dodge and brace.", type: "block", icon: "🛡️" });
    } else if (enemyName === "Bone Scout") {
      if (r < 0.5) setEnemyIntent({ name: "🏹 Piercing Arrow", desc: "Arrow piercing defense.", type: "attack", icon: "🏹" });
      else if (r < 0.8) setEnemyIntent({ name: "🩸 Splinter Sting", desc: "Causes player Bleeding.", type: "debuff", icon: "🩸" });
      else setEnemyIntent({ name: "🛡️ Bone Aegis", desc: "Raises skeletal block.", type: "block", icon: "🛡️" });
    } else if (enemyName === "Crypt Moth Swarm") {
      if (r < 0.7) setEnemyIntent({ name: "💨 Toxic Flurry", desc: "Puff of blinding spores.", type: "attack", icon: "🦋" });
      else setEnemyIntent({ name: "🌀 Soot Sleep", desc: "Attempts to stun you.", type: "debuff", icon: "🌀" });
    } else if (enemyName === "Rusted Watchman") {
      if (r < 0.6) setEnemyIntent({ name: "⚔️ Halberd Cleave", desc: "Heavy physical swipe.", type: "attack", icon: "🥾" });
      else setEnemyIntent({ name: "🛡️ Tower Gate Shield", desc: "Gains massive physical ward.", type: "block", icon: "🛡️" });
    } else if (enemyName === "Sorrow Ghast") {
      if (r < 0.5) setEnemyIntent({ name: "👻 Banshee Wail", desc: "Arcane mental attack.", type: "spell", icon: "💀" });
      else if (r < 0.8) setEnemyIntent({ name: "🩸 Health Siphon", desc: "Drains your health.", type: "spell", icon: "🩸" });
      else setEnemyIntent({ name: "🌀 Gloom Fog", desc: "Saps player Focus gems.", type: "debuff", icon: "🌀" });
    } else if (enemyName === "Ash Cultist") {
      if (r < 0.6) setEnemyIntent({ name: "🗡️ Cultist Ritual Cut", desc: "Extremely swift bleed slash.", type: "attack", icon: "🗡️" });
      else setEnemyIntent({ name: "🔥 Ignite Ashfall", desc: "Arcane column of fire.", type: "spell", icon: "🔥" });
    } else if (enemyName === "Grave Gargoyle") {
      if (r < 0.5) setEnemyIntent({ name: "🗿 Granite Bash", desc: "Heavy tectonic fist.", type: "attack", icon: "🗿" });
      else setEnemyIntent({ name: "🛡️ Stone Meditation", desc: "Blocks 80% of damage.", type: "block", icon: "🛡️" });
    } else if (enemyName === "Cinder Priest") {
      if (r < 0.5) setEnemyIntent({ name: "🔥 Igneous Ray", desc: "Blazing magma stream.", type: "spell", icon: "🔥" });
      else if (r < 0.8) setEnemyIntent({ name: "🩸 Brimstone Curse", desc: "Devastating burning-bleed.", type: "debuff", icon: "🩸" });
      else setEnemyIntent({ name: "🛡️ Fire Ward", desc: "Surrounding flame shield.", type: "block", icon: "🛡️" });
    } else if (enemyName === "The Hollow King") {
      if (r < 0.25) setEnemyIntent({ name: "👑 Sovereign Cleave", desc: "Aldric's master greatsword swing.", type: "attack", icon: "⚔️" });
      else if (r < 0.5) setEnemyIntent({ name: "⚡ Void Void Blast", desc: "Shattering void bolt.", type: "spell", icon: "⚡" });
      else if (r < 0.7) setEnemyIntent({ name: "🩸 Decimation siphon", desc: "Sucking life for recovery.", type: "spell", icon: "🩸" });
      else if (r < 0.9) setEnemyIntent({ name: "🛡️ Crown Bulwark", desc: "Aldric blocks all minor attacks.", type: "block", icon: "🛡️" });
      else setEnemyIntent({ name: "❄️ Frost Cage", desc: "Attempts to freeze your turns.", type: "debuff", icon: "❄️" });
    } else {
      setEnemyIntent({ name: "⚔️ Claw Swipe", desc: "A normal physical attack.", type: "attack", icon: "⚔️" });
    }
  }, []);

  // ---------- Combat Loop & Skills Execution ----------
  const resolveEnemyDeath = useCallback((enemyRef: Enemy) => {
    sound.sfx.hit();
    pushLog(`💀 The ${enemyRef.name} disintegrates into soot! (+${enemyRef.xp} XP, +${enemyRef.gold} Gold)`);
    setStatsKills((k) => k + 1);
    addDamageNumber("SOOT DISPEL!", C.gold, true);
    
    // Reset combat-related statuses
    setPlayerBleeding(0);
    setPlayerEnergized(0);
    setEnemyBleeding(0);
    setEnemyStunned(0);
    setEnemyIntent(null);

    setMapData((md: any) => {
      const [ex, ey] = combat!.enemyKey.split(",").map(Number);
      const g = md.grid.map((r: any) => r.slice());
      g[ey][ex] = enemyRef.boss ? "stairs" : "floor";
      const ne = { ...md.enemyData };
      delete ne[combat!.enemyKey];
      return { ...md, grid: g, enemyData: ne };
    });

    setStats((s) => s ? tryLevelUp({ ...s, xp: s.xp + enemyRef.xp, gold: s.gold + enemyRef.gold }) : null);

    setTimeout(() => {
      setCombat(null);
      setScreen(enemyRef.boss ? "victory" : "explore");
      if (enemyRef.boss) {
        pushLog("The crown of King Aldric shatters into fine powder. Ashveil's siege is lifted.");
        sound.sfx.victory();
      }
    }, enemyRef.boss ? 1100 : 400);
  }, [combat, pushLog, tryLevelUp, sound, addDamageNumber]);

  const enemyTurn = useCallback((enemyState: Enemy) => {
    if (enemyState.curHp <= 0) return;

    setTimeout(() => {
      // 1. Tick Enemy Bleeding if applicable
      setEnemyBleeding((prevBleed) => {
        if (prevBleed > 0) {
          const bleedDmg = 3;
          addDamageNumber(`-3 Bleed`, "#ff4444", true);
          pushLog(`🩸 Bleeding deals ${bleedDmg} damage to ${enemyState.name}.`);
          setCombat((c: any) => {
            if (!c) return null;
            const updatedHp = Math.max(0, c.enemy.curHp - bleedDmg);
            if (updatedHp <= 0) {
              setEnemyAnim("dead");
              resolveEnemyDeath(c.enemy);
            }
            return { ...c, enemy: { ...c.enemy, curHp: updatedHp } };
          });
          return prevBleed - 1;
        }
        return 0;
      });

      // 2. Check if enemy is stunned
      setEnemyStunned((prevStun) => {
        if (prevStun > 0) {
          pushLog(`🌀 The ${enemyState.name} is STUNNED and cannot act!`);
          addDamageNumber("STUNNED!", "#8bc34a", true);
          // Roll next intent anyway
          rollEnemyIntent(enemyState.name);
          return prevStun - 1;
        }

        // Proceed with normal enemy action based on intent
        setStats((s) => {
          if (!s) return null;
          
          let actionName = "strikes";
          let rawDmg = enemyState.atk + randRange(-1, 1);
          let blockEffect = false;
          let drainEffect = false;
          let bleedApply = false;
          let stunApply = false;

          const activeIntent = enemyIntent;
          if (activeIntent) {
            actionName = activeIntent.name;
            if (activeIntent.type === "block") {
              blockEffect = true;
              rawDmg = Math.floor(rawDmg * 0.4);
            } else if (activeIntent.type === "spell") {
              rawDmg = Math.floor(rawDmg * 1.3);
              if (activeIntent.name.includes("Siphon") || activeIntent.name.includes("drain")) {
                drainEffect = true;
              }
            } else if (activeIntent.type === "debuff") {
              if (activeIntent.name.includes("Sting") || activeIntent.name.includes("Bleed") || activeIntent.name.includes("Curse")) {
                bleedApply = true;
              } else if (activeIntent.name.includes("Sleep") || activeIntent.name.includes("Cage")) {
                stunApply = true;
              }
            }
          }

          // Calculate final damage after defense
          let dmg = Math.max(1, rawDmg - s.def);
          if (torchFuel === 0) {
            dmg = Math.floor(dmg * 1.2);
          }
          
          // Shield calculation
          setPlayerShield((sh) => {
            if (sh > 0) {
              const absorbed = Math.floor(dmg * sh);
              dmg = Math.max(0, dmg - absorbed);
              pushLog(`🛡️ Your shield barrier absorbs ${absorbed} damage!`);
              addDamageNumber(`Absorbed ${absorbed}`, "#5679db", false);
              return 0;
            }
            return sh;
          });

          // Apply damage to player
          const newHp = Math.max(0, s.hp - dmg);
          pushLog(`💥 ${enemyState.name} uses [${actionName}] dealing ${dmg} damage to you.`);
          addDamageNumber(`-${dmg}`, C.bloodBright, false);
          sound.sfx.hit();
          setEnemyAnim("attack");
          setTimeout(() => setEnemyAnim("idle"), 260);
          setPlayerAnim("hurt");
          setTimeout(() => setPlayerAnim("idle"), 300);

          if (equippedRelics.some((r) => r.name === "Ring of Thorns")) {
            pushLog("🛡️ Your Ring of Thorns flares! 4 physical thorns strike the enemy.");
            addDamageNumber("-4 Thorns", "#ff8a80", true);
            setCombat((c: any) => {
              if (!c) return null;
              const nextHp = Math.max(0, c.enemy.curHp - 4);
              if (nextHp <= 0) {
                setEnemyAnim("dead");
                resolveEnemyDeath(c.enemy);
              }
              return { ...c, enemy: { ...c.enemy, curHp: nextHp } };
            });
          }

          if (drainEffect && dmg > 0) {
            const healAmt = Math.floor(dmg * 0.5);
            pushLog(`🩸 ${enemyState.name} drains you, recovering +${healAmt} HP.`);
            addDamageNumber(`+${healAmt} Siphon`, "#4caf50", true);
            setCombat((c: any) => c ? { ...c, enemy: { ...c.enemy, curHp: Math.min(c.enemy.hp, c.enemy.curHp + healAmt) } } : null);
          }

          if (bleedApply) {
            setPlayerBleeding(3);
            pushLog("🩸 You are bleeding! You will take 3 damage at the end of each turn.");
            addDamageNumber("BLEEDING!", "#ff4444", false);
          }

          if (stunApply) {
            // Player gets stunned: drains 1 Focus
            pushLog("🌀 The ash chills your blood! You lose 1 Focus gem.");
            addDamageNumber("-1 Focus", C.arcane, false);
            s.focus = Math.max(0, s.focus - 1);
          }

          if (newHp <= 0) {
            setScreen("gameover");
            sound.sfx.gameover();
          }

          // Adrenaline generation on taking hit
          setAdrenaline((ad) => Math.min(100, ad + 15));

          return { ...s, hp: newHp, focus: Math.min(s.focusMax, s.focus + 1) };
        });

        // Tick player bleeding
        setPlayerBleeding((prevBleed) => {
          if (prevBleed > 0) {
            setStats((s) => {
              if (!s) return null;
              const bleedHp = Math.max(0, s.hp - 3);
              pushLog(`🩸 Player takes 3 Bleed damage.`);
              addDamageNumber(`-3 Bleed`, "#ff4444", false);
              if (bleedHp <= 0) {
                setScreen("gameover");
                sound.sfx.gameover();
              }
              return { ...s, hp: bleedHp };
            });
            return prevBleed - 1;
          }
          return 0;
        });

        // Roll the next turn's intention for tactical thinking
        rollEnemyIntent(enemyState.name);

        return 0;
      });
    }, 450);
  }, [pushLog, sound, enemyIntent, rollEnemyIntent, addDamageNumber, resolveEnemyDeath]);

  const playerAttack = useCallback(() => {
    if (!combat || !cls || !stats) return;
    setFirstStrike(false);
    sound.sfx.attack();
    setPlayerAnim("attack");
    setTimeout(() => setPlayerAnim("idle"), 260);

    // Adrenaline calculations
    let adrenalineMultiplier = 1.0;
    let isAdrenalineSurge = false;
    if (adrenaline === 100) {
      adrenalineMultiplier = 1.5;
      isAdrenalineSurge = true;
      setAdrenaline(0);
      doShake();
      sound.sfx.heal();
      pushLog("💥 ADRENALINE SURGE! Your next blow strikes with extreme force!");
      // Refill 10 HP
      setStats((s) => s ? { ...s, hp: Math.min(s.maxHp, s.hp + 10) } : null);
      addDamageNumber("+10 Surge Heal", "#8bc34a", false);
    } else {
      setAdrenaline((ad) => Math.min(100, ad + 15));
    }

    let rawDmg = stats.atk;
    if (torchFuel === 0) {
      rawDmg = Math.floor(rawDmg * 0.7);
    }
    if (playerEnergized > 0) {
      rawDmg = Math.floor(rawDmg * 1.35);
      setPlayerEnergized((prev) => prev - 1);
    }

    let dmg = Math.max(1, Math.floor(rawDmg * adrenalineMultiplier - combat.enemy.def + randRange(-1, 1)));
    
    // Check if enemy is currently blocking/meditating
    if (enemyIntent && enemyIntent.type === "block") {
      const blockReduction = enemyIntent.name.includes("Stone") ? 0.8 : 0.5;
      const blocked = Math.floor(dmg * blockReduction);
      dmg = Math.max(1, dmg - blocked);
      pushLog(`🛡️ Enemy blocked ${blocked} of your damage!`);
      addDamageNumber(`Blocked ${blocked}`, "#9e9e9e", true);
    }

    const newHp = Math.max(0, combat.enemy.curHp - dmg);
    pushLog(`⚔️ You ${cls.attackVerb} the ${combat.enemy.name} for ${dmg} damage.`);
    addDamageNumber(`-${dmg}`, "#ffffff", true);
    setEnemyAnim("hurt");
    setTimeout(() => setEnemyAnim("idle"), 300);

    if (newHp <= 0) {
      setEnemyAnim("dead");
      resolveEnemyDeath(combat.enemy);
      return;
    }

    setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
    enemyTurn({ ...combat.enemy, curHp: newHp });
  }, [combat, stats, cls, pushLog, enemyTurn, resolveEnemyDeath, sound, adrenaline, playerEnergized, enemyIntent, addDamageNumber, doShake]);

  const useSkill = useCallback((skillId: string) => {
    if (!combat || !stats || !cls) return;
    const skill = cls.skills.find((s) => s.id === skillId);
    if (!skill) return;
    if (stats.focus < skill.cost) {
      pushLog("Not enough active Focus Gems.");
      return;
    }

    setStats((s) => s ? { ...s, focus: s.focus - skill.cost } : null);
    setActionMenu("main");
    setAdrenaline((ad) => Math.min(100, ad + 15));

    if (skillId === "bash") {
      sound.sfx.attack();
      setPlayerAnim("attack");
      setTimeout(() => setPlayerAnim("idle"), 260);
      const dmg = Math.max(1, Math.floor(stats.atk * 1.5 - combat.enemy.def * 0.4));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`🛡️ SHIELD BASH! You slam ${combat.enemy.name} for ${dmg}, crumbling their armor.`);
      addDamageNumber(`-${dmg}`, "#e0a96d", true);
      addDamageNumber("SHIELD +60%", "#5679db", false);
      setPlayerShield(0.6); // Absorbs 60% of next hit
      setFirstStrike(false);
      setEnemyAnim("hurt");
      setTimeout(() => setEnemyAnim("idle"), 300);

      if (newHp <= 0) {
        setEnemyAnim("dead");
        resolveEnemyDeath(combat.enemy);
        return;
      }
      setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "wind") {
      const heal = Math.floor(stats.maxHp * 0.3);
      sound.sfx.heal();
      pushLog(`✨ SECOND WIND! You draw on deep stamina to heal ${heal} HP.`);
      addDamageNumber(`+${heal}`, "#4caf50", false);
      setStats((s) => s ? { ...s, hp: Math.min(s.maxHp, s.hp + heal) } : null);
      setFirstStrike(false);
      enemyTurn(combat.enemy);
    } else if (skillId === "fireball") {
      sound.sfx.attack();
      setPlayerAnim("attack");
      setTimeout(() => setPlayerAnim("idle"), 260);
      const dmg = Math.max(1, Math.floor(stats.atk * 1.95 - combat.enemy.def * 0.1));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`🔥 ARCANE FIREBALL! A pillar of searing fire immolates ${combat.enemy.name} for ${dmg}.`);
      addDamageNumber(`-${dmg} FIRE`, "#ff5722", true);
      setEnemyBleeding(2); // Inflicts burning bleed
      setFirstStrike(false);
      setEnemyAnim("hurt");
      setTimeout(() => setEnemyAnim("idle"), 300);

      if (newHp <= 0) {
        setEnemyAnim("dead");
        resolveEnemyDeath(combat.enemy);
        return;
      }
      setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "ward") {
      sound.sfx.heal();
      pushLog("❄️ FROST WARD. A spinning wall of cold ice covers you.");
      addDamageNumber("SHIELD +80%", "#5679db", false);
      setPlayerShield(0.8); // Absorbs 80% of next hit
      setFirstStrike(false);
      setStats((s) => s ? { ...s, hp: Math.min(s.maxHp, s.hp + 6) } : null);
      addDamageNumber("+6 Heal", "#4caf50", false);
      enemyTurn(combat.enemy);
    } else if (skillId === "backstab") {
      sound.sfx.attack();
      setPlayerAnim("attack");
      setTimeout(() => setPlayerAnim("idle"), 260);
      const mult = firstStrike ? 2.5 : 1.5;
      const dmg = Math.max(1, Math.floor(stats.atk * mult - combat.enemy.def * 0.3));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(
        firstStrike
          ? `🔪 PERFECT BACKSTAB! From the deep shadow, you carve for ${dmg} damage!`
          : `🔪 Backstab slices the enemy flank for ${dmg} damage.`
      );
      addDamageNumber(`-${dmg} CRIT`, "#ffc107", true);
      setEnemyBleeding(3); // Severe blood loss
      setFirstStrike(false);
      setEnemyAnim("hurt");
      setTimeout(() => setEnemyAnim("idle"), 300);

      if (newHp <= 0) {
        setEnemyAnim("dead");
        resolveEnemyDeath(combat.enemy);
        return;
      }
      setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "smoke") {
      const dmg = Math.max(0, Math.floor(stats.atk * 0.6 - combat.enemy.def));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`🌫️ SMOKE BOMB! A swift soot strike for ${dmg}—you vanish into thin air.`);
      addDamageNumber(`-${dmg}`, "#9e9e9e", true);
      addDamageNumber("VANISHED", "#ffffff", false);
      if (newHp <= 0) {
        resolveEnemyDeath(combat.enemy);
        return;
      }
      setCombat(null);
      setScreen("explore");
    }
  }, [combat, stats, cls, pushLog, enemyTurn, resolveEnemyDeath, firstStrike, sound, addDamageNumber, enemyIntent]);

  const playerDefend = useCallback(() => {
    if (!combat || !stats) return;
    setFirstStrike(false);
    pushLog("🛡️ You hunker down, bracing behind your iron defense guard.");
    addDamageNumber("+DEF GUARD", "#5679db", false);
    setAdrenaline((ad) => Math.min(100, ad + 15));
    
    setStats((s) => {
      if (!s) return null;
      let dmg = Math.max(0, Math.floor((combat.enemy.atk - s.def) / 2) + randRange(-1, 1));
      
      // Reduce damage due to guarding
      const newHp = Math.max(0, s.hp - dmg);
      if (dmg > 0) {
        pushLog(`🛡️ You absorb the block. Took ${dmg} heavy damage.`);
        addDamageNumber(`-${dmg}`, C.bloodBright, false);
        sound.sfx.hit();
        setPlayerAnim("hurt");
        setTimeout(() => setPlayerAnim("idle"), 300);
      } else {
        pushLog("🛡️ Flawless defense! You took 0 damage.");
        addDamageNumber("BLOCKED!", "#4caf50", false);
      }

      if (newHp <= 0) {
        setScreen("gameover");
        sound.sfx.gameover();
      }
      return { ...s, hp: newHp, focus: Math.min(s.focusMax, s.focus + 1) };
    });
  }, [combat, stats, pushLog, sound, addDamageNumber]);

  const playerFlee = useCallback(() => {
    if (!combat) return;
    setFirstStrike(false);
    if (rand(100) < 60) {
      pushLog("💨 You dive into the fog, successfully escaping back into the rooms.");
      addDamageNumber("ESCAPED!", "#ffffff", false);
      setCombat(null);
      setScreen("explore");
    } else {
      pushLog("❌ Flee failed! The enemy blocks your retreat!");
      addDamageNumber("FLEE FAILED!", C.bloodBright, false);
      enemyTurn(combat.enemy);
    }
  }, [combat, pushLog, enemyTurn, addDamageNumber]);

  const useConsumable = useCallback((idx: number, inFight: boolean) => {
    const item = inventory[idx];
    if (!item) return;

    if (item.type === "potion") {
      sound.sfx.heal();
      setStats((s) => s ? { ...s, hp: Math.min(s.maxHp, s.hp + (item.heal || 0)) } : null);
      setStatsPotionsDrunk((p) => p + 1);
      pushLog(`🧪 You consume the [${item.name}]. Recovered +${item.heal} HP.`);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
      if (inFight && combat) {
        setFirstStrike(false);
        enemyTurn(combat.enemy);
      }
    } else if (item.type === "torch") {
      sound.sfx.heal();
      setTorchFuel((f) => Math.min(100, f + 45));
      pushLog(`🕯️ You spark [${item.name}]. Repelled the shadows (+45 Torch Fuel).`);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
    } else if (item.type === "focus") {
      sound.sfx.heal();
      setStats((s) => s ? { ...s, focus: Math.min(s.focusMax, s.focus + (item.amt || 0)) } : null);
      pushLog(`🔷 You drink the glowing [${item.name}]. Channeled +${item.amt} Focus.`);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
    } else if (item.type === "relic") {
      if (inFight) {
        pushLog("❌ You cannot adjust equipped relics during combat!");
        return;
      }
      setEquippedRelics((prev) => {
        if (prev.some((r) => r.name === item.name)) {
          pushLog(`Relic [${item.name}] is already equipped!`);
          return prev;
        }
        if (prev.length >= 2) {
          const first = prev[0];
          setInventory((inv) => [...inv.filter((_, i) => i !== idx), first]);
          pushLog(`Unequipped [${first.name}] and equipped Relic: [${item.name}]. Passives active!`);
          return [prev[1], item];
        } else {
          setInventory((inv) => inv.filter((_, i) => i !== idx));
          pushLog(`Equipped Relic: [${item.name}]. Passives active!`);
          return [...prev, item];
        }
      });
    } else if (item.type === "scroll") {
      if (!inFight || !combat) {
        pushLog("Save this powerful spell scroll for the heat of battle.");
        return;
      }
      const dmg = item.dmg || 0;
      sound.sfx.attack();
      pushLog(`📜 You read [${item.name}]. A column of void sparks deals ${dmg} pure damage!`);
      setEnemyAnim("hurt");
      setTimeout(() => setEnemyAnim("idle"), 300);

      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
      setFirstStrike(false);

      if (newHp <= 0) {
        setEnemyAnim("dead");
        resolveEnemyDeath(combat.enemy);
      } else {
        setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
        enemyTurn({ ...combat.enemy, curHp: newHp });
      }
    }
  }, [inventory, pushLog, combat, enemyTurn, resolveEnemyDeath, sound]);

  const unequipRelic = useCallback((idx: number) => {
    setEquippedRelics((prev) => {
      const item = prev[idx];
      setInventory((inv) => [...inv, item]);
      pushLog(`Unequipped [${item.name}] and placed it back in your satchel.`);
      return prev.filter((_, i) => i !== idx);
    });
  }, [pushLog]);

  const throwConsumable = useCallback((idx: number) => {
    if (!combat || !stats) return;
    const item = inventory[idx];
    if (!item) return;

    sound.sfx.attack();
    doShake();
    setEnemyAnim("hurt");
    setTimeout(() => setEnemyAnim("idle"), 300);

    let thrownDmg = 10;
    if (item.type === "scroll") {
      thrownDmg = Math.floor((item.dmg || 0) * 1.5);
    }

    const nextEnemyHp = Math.max(0, combat.enemy.curHp - thrownDmg);

    if (item.type === "potion") {
      if (rand(2) === 0) {
        setEnemyStunned((s) => s + 1);
        pushLog(`🎯 You hurl [${item.name}]. It shatters on the ${combat.enemy.name}'s skull! Deals ${thrownDmg} damage and STUNS them.`);
        addDamageNumber("STUNNED!", "#8bc34a", true);
      } else {
        setEnemyBleeding((b) => b + 2);
        pushLog(`🎯 You hurl [${item.name}]. It cuts the ${combat.enemy.name}! Deals ${thrownDmg} damage and inflicts BLEEDING (2 turns).`);
        addDamageNumber("BLEEDING!", "#ff4444", true);
      }
    } else {
      pushLog(`🎯 You hurl [${item.name}] directly! A violent blast deals ${thrownDmg} damage!`);
    }

    addDamageNumber(`-${thrownDmg}`, "#ffc107", true);
    setInventory((inv) => inv.filter((_, i) => i !== idx));
    setActionMenu("main");
    setFirstStrike(false);

    if (nextEnemyHp <= 0) {
      setEnemyAnim("dead");
      resolveEnemyDeath(combat.enemy);
    } else {
      setCombat((c: any) => ({ ...c, enemy: { ...c.enemy, curHp: nextEnemyHp } }));
      enemyTurn({ ...combat.enemy, curHp: nextEnemyHp });
    }
  }, [inventory, combat, stats, pushLog, sound, doShake, resolveEnemyDeath, enemyTurn, addDamageNumber]);

  const performFocusSurge = useCallback(() => {
    if (!combat || !stats) return;
    if (stats.hp <= 8) {
      pushLog("❌ You don't have enough vitality to draw a Focus Surge!");
      return;
    }
    sound.sfx.heal();
    doShake();
    setStats((s) => s ? {
      ...s,
      hp: Math.max(1, s.hp - 8),
      focus: Math.min(s.focusMax, s.focus + 2)
    } : null);
    addDamageNumber("-8 HP Surge", C.bloodBright, false);
    addDamageNumber("+2 Focus Surge", C.gold, false);
    pushLog("⚡ FOCUS SURGE! You sacrifice 8 HP to force-channel +2 Focus Gems!");
  }, [combat, stats, pushLog, sound, addDamageNumber, doShake]);

  const buyItem = useCallback((offer: { item: Item; cost: number }) => {
    setStats((s) => {
      if (!s) return null;
      if (s.gold < offer.cost) {
        pushLog("❌ Not enough gold in your purse.");
        return s;
      }
      pushLog(`⚖️ Purchased a [${offer.item.name}] from the Scavenger.`);
      sound.sfx.pickup();
      if (offer.item.type === "key") {
        setKeyCount((k) => k + 1);
      } else {
        setInventory((inv) => [...inv, offer.item]);
      }
      setStatsGoldSpent((g) => g + offer.cost);
      return { ...s, gold: s.gold - offer.cost };
    });
  }, [pushLog, sound]);

  const restart = useCallback(() => {
    setStage("select");
    setSelectedClass(null);
    setStats(null);
    setInventory([]);
    setKeyCount(0);
    setLog([]);
    setCombat(null);
    setScreen("explore");
    setInSecret(false);
    setPlayerShield(0);
    setUnlockedLore([]);
    // Reset character customization
    setCustomTrait("scavenger");
    setCustomAtk(0);
    setCustomDef(0);
    setCustomHp(0);
    setCustomPoints(3);
  }, []);

  const hpPct = stats ? Math.max(0, (stats.hp / stats.maxHp) * 100) : 0;
  const xpPct = stats ? Math.max(0, (stats.xp / stats.xpToNext) * 100) : 0;
  const enemyHpPct = combat ? Math.max(0, (combat.enemy.curHp / combat.enemy.hp) * 100) : 0;

  // Compile tile sprites based on coordinate state
  const tileVisual = (tile: string, k: string) => {
    if (tile === "stairs") return <StairsIcon />;
    if (tile === "enemy") {
      const e = mapData?.enemyData[k];
      return e ? <EnemySprite enemy={e} /> : null;
    }
    if (tile === "item") {
      const it = mapData?.itemData[k];
      return it ? <ItemIcon item={it} /> : null;
    }
    if (tile === "chest") return <ChestIcon opened={false} />;
    if (tile === "lore") return <LoreIcon />;
    if (tile === "merchant") return <NpcIcon kind="merchant" />;
    if (tile === "portal") return <PortalIcon />;
    if (tile === "npc") return <NpcIcon kind={mapData?.npcData[k]?.kind} />;
    if (tile === "brazier") return <BrazierIcon />;
    if (tile === "shrine") return <div style={{ fontSize: 16 }}>⛩️</div>;
    if (tile === "trap") return <div style={{ fontSize: 15, opacity: 0.6 }}>🕸️</div>;
    if (tile === "cracked-wall") return (
      <div style={{
        width: "100%",
        height: "100%",
        background: "#1e1814",
        border: "1px solid #3a2e26",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#d4a728",
        fontSize: 10,
        fontWeight: "bold",
        textShadow: "0 0 3px #000"
      }}>🧱⛓️</div>
    );
    return null;
  };

  const shopOffers = [
    { item: CONSUMABLES[0], cost: 12 },
    { item: CONSUMABLES[2], cost: 15 },
    { item: CONSUMABLES[3], cost: 24 },
    { item: KEY_ITEM, cost: 10 },
    { item: RELICS[0], cost: 30 }, // Ring of Thorns
    { item: RELICS[1], cost: 25 }, // Void Heart
    { item: RELICS[2], cost: 24 }, // Gilded Hourglass
    { item: RELICS[3], cost: 22 }, // Eternal Ember
  ];

  return (
    <div
      style={{
        background: C.bg,
        color: C.bone,
        minHeight: "100vh",
        fontFamily: MONO,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        position: "relative",
        animation: shake ? "screenShake 0.26s" : "none",
        overflowX: "hidden",
      }}
    >
      {/* Stylesheets */}
      <style>{`
        @keyframes screenShake{0%,100%{transform:translate(0,0);}20%{transform:translate(-5px,3px);}40%{transform:translate(5px,-3px);}60%{transform:translate(-3px,1.5px);}80%{transform:translate(3px,-1.5px);}}
        @keyframes floatIdle{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes flicker{0%,100%{opacity:1;}50%{opacity:0.6;}}
        @keyframes sway{0%{transform:rotate(-3deg);}100%{transform:rotate(3deg);}}
        @keyframes lungeRight{0%{transform:translateX(0) scale(1);}40%{transform:translateX(24px) scale(1.08);}100%{transform:translateX(0) scale(1);}}
        @keyframes hurtShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-8px);}50%{transform:translateX(8px);}75%{transform:translateX(-5px);}}
        @keyframes deathFade{0%{opacity:1;transform:scale(1) rotate(0deg);}100%{opacity:0;transform:scale(0.3) rotate(35deg) translateY(30px);}}
        @keyframes walkBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes hitFlash{0%{background:rgba(217,59,59,0.6);}100%{background:rgba(217,59,59,0);}}
        @keyframes overlayFade{0%{opacity:0;}15%{opacity:1;}85%{opacity:1;}100%{opacity:0;}}
        @keyframes spinSlow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>

      {/* Slide transition screen */}
      {transition && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#030202",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "overlayFade 0.85s ease forwards",
          }}
        >
          <div style={{ fontSize: 48, animation: "spinSlow 1.5s linear infinite" }}>{transition.icon}</div>
          <div
            style={{
              fontFamily: SERIF,
              color: C.gold,
              marginTop: 14,
              fontSize: 16,
              letterSpacing: "0.08em",
            }}
          >
            {transition.label}
          </div>
        </div>
      )}

      {/* Vanguard Talent Ascension Selection Modal Overlay */}
      {activeLevelUpChoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 2, 2, 0.94)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: C.panel,
              border: `2px solid ${C.gold}`,
              borderRadius: 8,
              padding: 24,
              maxWidth: 450,
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.9)",
              textAlign: "center",
              animation: "fadeInUp 0.3s ease",
            }}
          >
            <div style={{ fontSize: 36, animation: "flicker 1.5s infinite" }}>⭐</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, color: C.gold, margin: "10px 0 6px" }}>Vanguard Ascension</h2>
            <p style={{ color: C.boneDim, fontSize: 11, fontStyle: "italic", marginBottom: 16 }}>
              You have attained Level {activeLevelUpChoice.level}! Select an additional Mastery Talent to forge your legend:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => {
                  setStats((s) => {
                    if (!s) return null;
                    return { ...s, maxHp: s.maxHp + 12, hp: s.maxHp + 12 };
                  });
                  pushLog("🛡️ Selected Mastery: IRON HEART (+12 Max HP & Full Heal).");
                  sound.sfx.heal();
                  setActiveLevelUpChoice(null);
                }}
                style={{
                  background: "#1e1814",
                  border: `1px solid ${C.border}`,
                  padding: 12,
                  borderRadius: 6,
                  color: C.bone,
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ fontWeight: "bold", fontSize: 13, color: C.gold }}>🛡️ Aegis Heart</div>
                <div style={{ fontSize: 10, color: C.boneDim, marginTop: 2 }}>Increases maximum Vitality (+12 Max HP) and fully restores health.</div>
              </button>

              <button
                onClick={() => {
                  setStats((s) => {
                    if (!s) return null;
                    return { ...s, atk: s.atk + 3 };
                  });
                  pushLog("⚔️ Selected Mastery: OVERPOWERING BLADE (+3 permanent ATK).");
                  sound.sfx.attack();
                  setActiveLevelUpChoice(null);
                }}
                style={{
                  background: "#1e1814",
                  border: `1px solid ${C.border}`,
                  padding: 12,
                  borderRadius: 6,
                  color: C.bone,
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ fontWeight: "bold", fontSize: 13, color: C.gold }}>⚔️ Overpowering Blade</div>
                <div style={{ fontSize: 10, color: C.boneDim, marginTop: 2 }}>Sharpens weapon edge permanently (+3 ATK). Deals higher criticals.</div>
              </button>

              <button
                onClick={() => {
                  setStats((s) => {
                    if (!s) return null;
                    return { ...s, focusMax: s.focusMax + 1, focus: s.focusMax + 1 };
                  });
                  pushLog("🔷 Selected Mastery: VOID ATTUNEMENT (+1 Focus Gem).");
                  sound.sfx.heal();
                  setActiveLevelUpChoice(null);
                }}
                style={{
                  background: "#1e1814",
                  border: `1px solid ${C.border}`,
                  padding: 12,
                  borderRadius: 6,
                  color: C.bone,
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ fontWeight: "bold", fontSize: 13, color: C.gold }}>🔷 Void Attunement</div>
                <div style={{ fontSize: 10, color: C.boneDim, marginTop: 2 }}>Gains an additional active Focus gem Slot (+1 Max Focus) and refills focus.</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lore Codex Antique Book Parchment Overlay */}
      {activeLoreCodex && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 2, 2, 0.95)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: "#ebdcb9", // Genuine weathered antique paper background color!
              border: "10px double #4a341e",
              borderRadius: 4,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 15px 40px rgba(0,0,0,0.95)",
              color: "#201205",
              fontFamily: SERIF,
              animation: "fadeInUp 0.3s ease",
              position: "relative",
            }}
          >
            <h3 style={{ fontSize: 20, textAlign: "center", borderBottom: "2px solid #5c3e21", paddingBottom: 8, fontWeight: "bold", color: "#402202" }}>
              📜 {activeLoreCodex.title}
            </h3>
            
            <div style={{ maxHeight: 280, overflowY: "auto", margin: "16px 0", fontSize: 13, lineHeight: 1.6, fontStyle: "italic", paddingRight: 6 }}>
              {activeLoreCodex.content}
            </div>

            <div style={{ borderTop: "1px dashed #5c3e21", paddingTop: 12, textAlign: "center" }}>
              <button
                onClick={() => {
                  sound.sfx.pickup();
                  setActiveLoreCodex(null);
                }}
                style={{
                  background: "#402202",
                  border: "none",
                  borderRadius: 4,
                  color: "#ebdcb9",
                  padding: "6px 16px",
                  fontSize: 11,
                  fontFamily: MONO,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                CLOSE MANUSCRIPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Shrine Dialog Overlay (Batch 2) */}
      {activeShrine && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 2, 2, 0.95)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: "#181412",
              border: `2px solid ${C.gold}`,
              boxShadow: "0 0 20px rgba(212, 167, 40, 0.25), inset 0 0 40px rgba(0,0,0,0.9)",
              borderRadius: 8,
              padding: 24,
              maxWidth: 520,
              width: "100%",
              animation: "fadeInUp 0.3s ease",
            }}
          >
            <div style={{ textAlign: "center", fontSize: 28, marginBottom: 8 }}>⛩️</div>
            <h3 style={{
              fontFamily: SERIF,
              fontSize: 19,
              fontWeight: "bold",
              color: C.gold,
              textAlign: "center",
              marginBottom: 12,
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              {activeShrine.name}
            </h3>
            <p style={{
              fontSize: 12.5,
              color: C.boneDim,
              lineHeight: 1.6,
              textAlign: "center",
              marginBottom: 20,
              fontStyle: "italic"
            }}>
              "{activeShrine.desc}"
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeShrine.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={opt.action}
                  style={{
                    background: "#221a16",
                    border: `1px solid ${C.border}`,
                    borderRadius: 5,
                    color: C.bone,
                    padding: "12px 14px",
                    fontSize: 11.5,
                    fontFamily: MONO,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.gold;
                    e.currentTarget.style.background = "#2a1e18";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = "#221a16";
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialogue System overlay overlay */}
      {activeNpc && (
        <DialogSystem
          npc={activeNpc}
          playerClass={cls?.key}
          onClose={(reward, statBonus) => {
            if (reward) grantItem(reward);
            if (statBonus) {
              setStats((s) => {
                if (!s) return null;
                const nextS = { ...s };
                if (statBonus.atk) nextS.atk += statBonus.atk;
                if (statBonus.def) nextS.def += statBonus.def;
                if (statBonus.gold) nextS.gold += statBonus.gold;
                if (statBonus.maxHp) {
                  nextS.maxHp += statBonus.maxHp;
                  nextS.hp += statBonus.maxHp;
                }
                if (statBonus.focusMax) {
                  nextS.focusMax += statBonus.focusMax;
                  nextS.focus = nextS.focusMax;
                }
                return nextS;
              });
              if (statBonus.pushLogMsg) pushLog(statBonus.pushLogMsg);
            }

            // Remove NPC from map if they have been completed
            if (activeNpcKey && mapData) {
              setMapData((md: any) => {
                const g = md.grid.map((r: any) => r.slice());
                const [nx, ny] = activeNpcKey.split(",").map(Number);
                g[ny][nx] = "floor";
                const nn = { ...md.npcData };
                delete nn[activeNpcKey];
                return { ...md, grid: g, npcData: nn };
              });
            }

            setActiveNpc(null);
            setActiveNpcKey(null);
          }}
        />
      )}

      {/* Outer framing wrapper */}
      <div style={{ width: "100%", maxWidth: 1050, position: "relative" }}>
        
        {/* Main Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            borderBottom: `1px solid ${C.border}`,
            paddingBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏰</span>
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  letterSpacing: "0.14em",
                  fontSize: 22,
                  color: C.gold,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Ashveil
              </div>
              <div style={{ color: C.boneDim, fontSize: 10, letterSpacing: "0.06em" }}>
                THE SIEGE OF A HOLLOW MONARCH
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Volume toggle */}
            <button
              onClick={toggleMute}
              style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                color: C.boneDim,
                padding: "6px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="hidden sm:inline">{muted ? "MUTED" : "SOUNDS"}</span>
            </button>
          </div>
        </header>

        {/* ==================== TITLE SCREEN ==================== */}
        {stage === "title" && (
          <div
            className="animate-[fadeInUp_0.4s_ease]"
            style={{
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12, animation: "flicker 2.5s ease-in-out infinite" }}>
              🕯️
            </div>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 42,
                color: C.gold,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: "0 0 6px",
              }}
            >
              Ashveil
            </h1>
            <div
              style={{
                fontSize: 13,
                color: C.boneDim,
                marginBottom: 32,
                letterSpacing: "0.1em",
                fontStyle: "italic",
              }}
            >
              A TACTICAL DUNGEON CRAWLER OF GRIEF & ASH
            </div>
            <button
              onClick={beginFromTitle}
              style={{
                background: C.blood,
                border: `1px solid ${C.bloodBright}`,
                color: C.bone,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: "bold",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: MONO,
                letterSpacing: "0.05em",
                boxShadow: `0 4px 14px ${C.blood}60`,
                transition: "transform 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.bloodBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.blood;
              }}
            >
              Tap to Awaken
            </button>
          </div>
        )}

        {/* ==================== TRAILER LORE SLIDES ==================== */}
        {stage === "trailer" && (
          <div
            style={{
              minHeight: 450,
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 30,
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.85)",
            }}
          >
            <button
              onClick={skipTrailer}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.boneDim,
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: MONO,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              Skip Prologue ▶
            </button>

            <div
              key={trailerIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 380,
                textAlign: "center",
                animation: "fadeInUp 0.8s ease",
              }}
            >
              <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                {TRAILER_SLIDES[trailerIndex].key === "title" && <div style={{ fontSize: 64 }}>🏰</div>}
                {TRAILER_SLIDES[trailerIndex].key === "dark" && (
                  <div style={{ width: 64, height: 72, opacity: 0.8 }}>
                    <BrazierIcon />
                  </div>
                )}
                {TRAILER_SLIDES[trailerIndex].key === "king" && (
                  <div style={{ width: 90, height: 96 }}>
                    <ClassSprite classKey="king" accent="#c22d2d" />
                  </div>
                )}
                {TRAILER_SLIDES[trailerIndex].key === "heroes" && (
                  <div style={{ display: "flex", gap: 18 }}>
                    <div style={{ width: 44, height: 56 }}>
                      <ClassSprite classKey="knight" accent={CLASSES.knight.accent} />
                    </div>
                    <div style={{ width: 44, height: 56 }}>
                      <ClassSprite classKey="mage" accent={CLASSES.mage.accent} />
                    </div>
                    <div style={{ width: 44, height: 56 }}>
                      <ClassSprite classKey="rogue" accent={CLASSES.rogue.accent} />
                    </div>
                  </div>
                )}
                {TRAILER_SLIDES[trailerIndex].key === "call" && (
                  <div style={{ fontSize: 58, animation: "flicker 2s ease-in-out infinite" }}>👑</div>
                )}
              </div>

              <h2
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  color: C.gold,
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                  padding: "0 10px",
                }}
              >
                {TRAILER_SLIDES[trailerIndex].title}
              </h2>
              {TRAILER_SLIDES[trailerIndex].sub && (
                <p
                  style={{
                    fontSize: 13,
                    color: C.boneDim,
                    lineHeight: 1.7,
                    maxWidth: 480,
                    margin: "0 0 28px",
                  }}
                >
                  {TRAILER_SLIDES[trailerIndex].sub}
                </p>
              )}

              {trailerIndex === TRAILER_SLIDES.length - 1 && (
                <button
                  onClick={skipTrailer}
                  style={{
                    background: C.blood,
                    border: `1px solid ${C.bloodBright}`,
                    color: C.bone,
                    padding: "10px 24px",
                    borderRadius: 5,
                    fontSize: 13,
                    fontFamily: MONO,
                    cursor: "pointer",
                  }}
                >
                  Assemble Your Will
                </button>
              )}
            </div>

            {/* Pagination dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {TRAILER_SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: i === trailerIndex ? C.gold : C.border,
                    transition: "background 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ==================== SELECT HERO CLASS ==================== */}
        {stage === "select" && (
          <div className="animate-[fadeInUp_0.4s_ease]">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 24, color: C.gold, margin: "0 0 4px" }}>
                Select Your Vanguard
              </h2>
              <p style={{ fontSize: 12, color: C.boneDim }}>Each hero brings unique tools to survive the hollow siege.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(CLASSES).map((c) => (
                <div
                  key={c.key}
                  style={{
                    background: C.panel,
                    border: `2px solid ${selectedClass === c.key ? c.accent : C.border}`,
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 56 }}>
                        <ClassSprite classKey={c.key} accent={c.accent} />
                      </div>
                      <div>
                        <div style={{ fontFamily: SERIF, fontSize: 18, color: c.accent, fontWeight: "bold" }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 11, color: C.boneDim }}>{c.title}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.boneDim, lineHeight: 1.6, marginBottom: 14 }}>
                      {c.backstory}
                    </p>
                    
                    {/* Skills list preview */}
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: C.gold, marginBottom: 4, letterSpacing: "0.05em" }}>
                        CLASS REPERTOIRE:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {c.skills.map((sk) => (
                          <div key={sk.id} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{sk.icon}</span>
                            <span style={{ color: C.bone }}>{sk.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => chooseClass(c.key)}
                    style={{
                      background: C.blood,
                      color: C.bone,
                      border: `1px solid ${C.bloodBright}`,
                      borderRadius: 5,
                      padding: "10px 14px",
                      fontSize: 12,
                      fontFamily: MONO,
                      fontWeight: "bold",
                      cursor: "pointer",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = c.accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = C.blood)}
                  >
                    Summon {c.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== INTRODUCTORY SCENE & CHARACTER CREATOR ==================== */}
        {stage === "intro" && cls && (
          <div
            className="animate-[fadeInUp_0.4s_ease] w-full max-w-4xl mx-auto"
            style={{
              background: C.panel,
              border: `1.5px solid ${C.border}`,
              borderRadius: 8,
              padding: "24px 28px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.95), inset 0 0 15px rgba(58,46,38,0.3)",
            }}
          >
            {/* Title Header */}
            <div style={{ textAlign: "center", marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 4 }}>🎭</div>
              <h2 style={{ fontFamily: SERIF, fontSize: 22, color: C.gold, margin: "2px 0" }}>
                Forging the Voidwanderer
              </h2>
              <div style={{ fontSize: 11, color: C.boneDim, fontFamily: MONO, letterSpacing: "0.08em" }}>
                CHARACTER CUSTOMIZATION & PERK SELECTION
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: Lore & Standee Preview */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 16, color: C.gold, marginBottom: 8 }}>
                    Chosen Path: {cls.name}
                  </h3>
                  <p style={{ fontSize: 12.5, lineHeight: 1.6, color: C.boneDim, marginBottom: 14 }}>
                    {cls.backstory}
                  </p>
                </div>

                {/* Pedestal & Sprite Standee */}
                <div style={{ textAlign: "center", margin: "16px 0", position: "relative" }}>
                  <div
                    style={{
                      width: 64,
                      height: 80,
                      margin: "0 auto",
                      animation: "floatIdle 2.2s ease-in-out infinite",
                      filter: `drop-shadow(0 0 12px ${cls.accent}50)`,
                      zIndex: 5,
                      position: "relative",
                    }}
                  >
                    <ClassSprite classKey={cls.key} accent={cls.accent} />
                  </div>
                  {/* Glowing 3D Pedestal Ring */}
                  <div
                    style={{
                      width: 80,
                      height: 16,
                      background: `radial-gradient(ellipse, ${cls.accent}30 0%, transparent 70%)`,
                      border: `1.5px solid ${cls.accent}50`,
                      borderRadius: "50%",
                      margin: "-6px auto 0 auto",
                      boxShadow: `0 0 10px ${cls.accent}20`,
                    }}
                  />
                </div>

                {/* Base Stats Summary */}
                <div style={{ background: C.bg, padding: 10, borderRadius: 4, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: MONO, color: C.gold, marginBottom: 6, letterSpacing: "0.05em" }}>
                    BASE CLASS SPECS:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center" style={{ fontFamily: MONO, fontSize: 11 }}>
                    <div>
                      <div style={{ color: C.boneDim }}>HEALTH</div>
                      <div style={{ color: C.bone, fontWeight: "bold" }}>{cls.base.maxHp} HP</div>
                    </div>
                    <div>
                      <div style={{ color: C.boneDim }}>ATTACK</div>
                      <div style={{ color: C.bloodBright, fontWeight: "bold" }}>{cls.base.atk} DMG</div>
                    </div>
                    <div>
                      <div style={{ color: C.boneDim }}>DEFENSE</div>
                      <div style={{ color: C.moss, fontWeight: "bold" }}>{cls.base.def} DEF</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Traits & Point Allocations */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Section 1: Choose Starting Trait */}
                <div>
                  <div style={{ fontSize: 11, fontFamily: MONO, color: C.gold, marginBottom: 8, letterSpacing: "0.05em" }}>
                    1. SELECT STARTING ORIGIN PERK:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: "scavenger",
                        name: "Scavenger",
                        icon: "🧪",
                        desc: "+25 Gold & 1 Health Elixir.",
                      },
                      {
                        key: "acolyte",
                        name: "Acolyte",
                        icon: "🌀",
                        desc: "+1 Max Focus & +5 Max HP.",
                      },
                      {
                        key: "ward",
                        name: "Defender",
                        icon: "🛡️",
                        desc: "+2 Permanent Defense.",
                      },
                      {
                        key: "slayer",
                        name: "Slayer",
                        icon: "🩸",
                        desc: "+2 Permanent Attack.",
                      },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setCustomTrait(t.key as any)}
                        style={{
                          background: customTrait === t.key ? "#2a1e16" : C.panel2,
                          border: `1px solid ${customTrait === t.key ? cls.accent : C.border}`,
                          borderRadius: 5,
                          padding: 10,
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{t.icon}</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: "bold",
                              color: customTrait === t.key ? C.gold : C.bone,
                              fontFamily: SERIF,
                            }}
                          >
                            {t.name}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: C.boneDim, lineHeight: 1.3 }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Allocate Attribute Points */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.15)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 11, fontFamily: MONO, color: C.gold, letterSpacing: "0.05em" }}>
                      2. DISTRIBUTE BONUS STAT POINTS:
                    </span>
                    <span
                      style={{
                        background: customPoints > 0 ? C.blood : "#201a16",
                        color: C.bone,
                        fontFamily: MONO,
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 3,
                        fontWeight: "bold",
                      }}
                    >
                      {customPoints} PT{customPoints !== 1 ? "S" : ""} REMAINING
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Stat Item 1: ATTACK */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, color: C.bone, fontFamily: MONO }}>Strength (+ATK)</span>
                        <div style={{ fontSize: 9, color: C.boneDim }}>+1 DMG per point allocated</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          disabled={customAtk === 0}
                          onClick={() => {
                            setCustomAtk(customAtk - 1);
                            setCustomPoints(customPoints + 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customAtk === 0 ? "not-allowed" : "pointer",
                            opacity: customAtk === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: C.gold, minWidth: 20, textAlign: "center" }}>
                          +{customAtk}
                        </span>
                        <button
                          disabled={customPoints === 0}
                          onClick={() => {
                            setCustomAtk(customAtk + 1);
                            setCustomPoints(customPoints - 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customPoints === 0 ? "not-allowed" : "pointer",
                            opacity: customPoints === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Stat Item 2: DEFENSE */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, color: C.bone, fontFamily: MONO }}>Fortitude (+DEF)</span>
                        <div style={{ fontSize: 9, color: C.boneDim }}>+1 DEF defense per point allocated</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          disabled={customDef === 0}
                          onClick={() => {
                            setCustomDef(customDef - 1);
                            setCustomPoints(customPoints + 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customDef === 0 ? "not-allowed" : "pointer",
                            opacity: customDef === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: C.gold, minWidth: 20, textAlign: "center" }}>
                          +{customDef}
                        </span>
                        <button
                          disabled={customPoints === 0}
                          onClick={() => {
                            setCustomDef(customDef + 1);
                            setCustomPoints(customPoints - 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customPoints === 0 ? "not-allowed" : "pointer",
                            opacity: customPoints === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Stat Item 3: VITALITY */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, color: C.bone, fontFamily: MONO }}>Vitality (+HP)</span>
                        <div style={{ fontSize: 9, color: C.boneDim }}>+5 HP per point allocated</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          disabled={customHp === 0}
                          onClick={() => {
                            setCustomHp(customHp - 5);
                            setCustomPoints(customPoints + 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customHp === 0 ? "not-allowed" : "pointer",
                            opacity: customHp === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontFamily: MONO, fontSize: 13, color: C.gold, minWidth: 20, textAlign: "center" }}>
                          +{customHp}
                        </span>
                        <button
                          disabled={customPoints === 0}
                          onClick={() => {
                            setCustomHp(customHp + 5);
                            setCustomPoints(customPoints - 1);
                          }}
                          style={{
                            background: C.panel2,
                            border: `1px solid ${C.border}`,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            color: C.bone,
                            cursor: customPoints === 0 ? "not-allowed" : "pointer",
                            opacity: customPoints === 0 ? 0.4 : 1,
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Play Actions */}
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: C.boneDim, marginBottom: 14, fontFamily: SERIF, fontStyle: "italic" }}>
                "The castle layout has been completely distorted. Shadows have grown teeth, and a loyal
                Gate Watch wanders the flagstones as hollow bone. Wake up... the Void Gates await."
              </p>
              <button
                onClick={beginGame}
                style={{
                  background: C.blood,
                  color: C.bone,
                  border: `1px solid ${C.bloodBright}`,
                  padding: "13px 40px",
                  borderRadius: 6,
                  fontFamily: MONO,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 14,
                  letterSpacing: "0.05em",
                  boxShadow: `0 4px 15px rgba(224, 86, 86, 0.25)`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.bloodBright;
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.blood;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Awaken Hero & Enter Ashveil
              </button>
            </div>
          </div>
        )}

        {/* ==================== CORE GAMEPLAY ==================== */}
        {stage === "game" && stats && cls && (
          <div>
            {/* GAME SCREEN OVERLAYS: GAME OVER AND VICTORY */}
            {(screen === "gameover" || screen === "victory") && (
              <div
                className="animate-[fadeInUp_0.4s_ease]"
                style={{
                  background: C.panel,
                  border: `2px solid ${screen === "victory" ? C.gold : C.blood}`,
                  borderRadius: 8,
                  padding: 30,
                  textAlign: "center",
                  maxWidth: 540,
                  margin: "20px auto",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.9)",
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 14 }}>
                  {screen === "victory" ? "👑" : "💀"}
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontSize: 24,
                    color: screen === "victory" ? C.gold : C.bloodBright,
                    marginBottom: 16,
                  }}
                >
                  {screen === "victory" ? "Ashveil Restored" : "Your Will Has Broken"}
                </h2>

                {screen === "victory" ? (
                  <div style={{ textAlign: "left", fontSize: 13, color: C.boneDim, lineHeight: 1.8 }}>
                    <p style={{ marginBottom: 10 }}>
                      The heavy obsidian crown crumbles into fine gray ash between your fingers.
                      The oppressive cold chill of the throne room recedes, leaving only the quiet of the morning star.
                    </p>
                    <p style={{ marginBottom: 10 }}>
                      Underneath the shadow armor, for a brief second, you saw a tired widower's face.
                      Aldric didn't seek power; he sought to deny death. Ashveil never fell to a siege.
                      It fell to a king's refusal to mourn.
                    </p>
                    <p style={{ fontStyle: "italic", borderLeft: `2px solid ${C.gold}`, paddingLeft: 12, margin: "14px 0" }}>
                      "{cls.epilogue}"
                    </p>
                    <div style={{ color: C.gold, textAlign: "center", margin: "18px 0", fontWeight: "bold" }}>
                      — THE END —
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: C.boneDim, lineHeight: 1.7, marginBottom: 20 }}>
                    You fell inside {FLOOR_META[floor]?.name}. Your ash drifts down onto the cracked flagstones
                    to join the rest of the silent watchmen. The Hollow King sits undisturbed.
                  </p>
                )}

                <div
                  style={{
                    fontSize: 12,
                    color: C.bone,
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "16px 20px",
                    width: "100%",
                    marginBottom: 24,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: screen === "victory" ? C.gold : C.bloodBright,
                      borderBottom: `1px solid ${C.border}`,
                      paddingBottom: 6,
                      marginBottom: 10,
                      fontWeight: "bold",
                    }}
                  >
                    📜 The Chronicle of Ash (Run Conquest)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontFamily: MONO, fontSize: 11, color: C.boneDim }}>
                    <div>👤 Hero Class: <span style={{ color: C.bone }}>{cls.name}</span></div>
                    <div>⭐ Level Reached: <span style={{ color: C.bone }}>{stats.level}</span></div>
                    <div>⚔️ Enemies Slain: <span style={{ color: C.bone }}>{statsKills}</span></div>
                    <div>👣 Steps Taken: <span style={{ color: C.bone }}>{statsSteps}</span></div>
                    <div>🌀 Secret Rifts: <span style={{ color: C.bone }}>{statsSecretRooms}</span></div>
                    <div>⛩️ Shrines Visited: <span style={{ color: C.bone }}>{statsShrines}</span></div>
                    <div>🧪 Potions Drunk: <span style={{ color: C.bone }}>{statsPotionsDrunk}</span></div>
                    <div>💰 Gold Spent: <span style={{ color: C.bone }}>{statsGoldSpent} Gold</span></div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={restart}
                    style={{
                      background: C.blood,
                      color: C.bone,
                      border: `1px solid ${C.bloodBright}`,
                      padding: "10px 24px",
                      borderRadius: 5,
                      cursor: "pointer",
                      fontFamily: MONO,
                    }}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* NORMAL ACTIVE GAMEPLAY HUD */}
            {screen !== "gameover" && screen !== "victory" && (
              <div>
                {/* DUAL MODE LAYOUT: WIDESCREEN BENTO GRID ON DESKTOP, TABBED ON MOBILE */}
                
                {/* Widescreen Desktop Bento Grid */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-6">
                  
                  {/* LEFT PANEL: HERO DOSSIER (COL SPAN 3) */}
                  <div
                    className="md:col-span-3"
                    style={{
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 16,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {/* Character headpiece card */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 46 }}>
                          <ClassSprite classKey={cls.key} accent={cls.accent} />
                        </div>
                        <div>
                          <div style={{ fontFamily: SERIF, fontSize: 15, color: cls.accent, fontWeight: "bold" }}>
                            {stats.hp <= 0 ? "Fallen Hero" : stats.hp < stats.maxHp * 0.35 ? "Wounded Hero" : cls.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.boneDim }}>{cls.title}</div>
                        </div>
                      </div>

                      {/* HP Gauge */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Heart size={12} color={C.bloodBright} /> {stats.hp}/{stats.maxHp}
                          </span>
                          <span>Lv {stats.level}</span>
                        </div>
                        <div style={{ background: "#000", borderRadius: 3, height: 6, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${hpPct}%`,
                              height: "100%",
                              background: C.bloodBright,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* XP Gauge */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.boneDim, marginBottom: 3 }}>
                          <span>XP {stats.xp}/{stats.xpToNext}</span>
                        </div>
                        <div style={{ background: "#000", borderRadius: 2, height: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${xpPct}%`,
                              height: "100%",
                              background: C.gold,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Focus Gems */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, background: C.bg, padding: "6px 10px", borderRadius: 4, border: `1px solid ${C.border}` }}>
                        <Sparkles size={11} color={cls.accent} />
                        <span style={{ fontSize: 10, color: C.boneDim, marginRight: 4 }}>FOCUS GEMS:</span>
                        <div style={{ display: "flex", gap: 3 }}>
                          {Array.from({ length: stats.focusMax }).map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color: i < stats.focus ? cls.accent : "#2d231a",
                                fontSize: 14,
                                textShadow: i < stats.focus ? `0 0 5px ${cls.accent}80` : "none",
                              }}
                            >
                              ◆
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Torch & Adrenaline Gauges */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, background: "rgba(0,0,0,0.15)", padding: 10, borderRadius: 6, border: `1px solid ${C.border}` }}>
                        {/* Torch Fuel */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.boneDim, marginBottom: 4 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Flame size={12} color={torchFuel > 30 ? C.gold : C.bloodBright} />
                              TORCH LIGHT:
                            </span>
                            <span style={{ fontWeight: "bold", color: torchFuel > 30 ? C.bone : C.bloodBright }}>{torchFuel}%</span>
                          </div>
                          <div style={{ background: "#000", borderRadius: 2, height: 5, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${torchFuel}%`,
                                height: "100%",
                                background: torchFuel > 50 ? C.gold : torchFuel > 25 ? C.moss : C.bloodBright,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>

                        {/* Adrenaline Bar */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.boneDim, marginBottom: 4 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Zap size={12} color={adrenaline >= 100 ? C.bloodBright : C.boneDim} style={{ animation: adrenaline >= 100 ? "flicker 1.5s infinite" : "none" }} />
                              COMBAT ADRENALINE:
                            </span>
                            <span style={{ fontWeight: "bold", color: adrenaline >= 100 ? C.bloodBright : C.bone }}>{adrenaline}/100</span>
                          </div>
                          <div style={{ background: "#000", borderRadius: 2, height: 5, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${adrenaline}%`,
                                height: "100%",
                                background: adrenaline >= 100 ? `linear-gradient(90deg, ${C.blood}, ${C.bloodBright})` : C.slate,
                                transition: "width 0.2s ease",
                              }}
                            />
                          </div>
                          {adrenaline >= 100 && (
                            <div style={{ fontSize: 8, color: C.bloodBright, marginTop: 3, letterSpacing: "0.05em", animation: "flicker 1s infinite", textAlign: "center", fontWeight: "bold" }}>
                              🔥 READY FOR ADRENALINE SURGE (+150% DAMAGE) 🔥
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats Table */}
                      <div style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                          <span className="text-gray-400">Weapon DMG:</span>
                          <span style={{ color: C.bone, fontWeight: "bold" }}>
                            <Sword size={11} style={{ inlineSize: 11, display: "inline", verticalAlign: -1, marginRight: 3 }} />
                            {stats.atk}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                          <span className="text-gray-400">Plate Armor:</span>
                          <span style={{ color: C.bone, fontWeight: "bold" }}>
                            <Shield size={11} style={{ inlineSize: 11, display: "inline", verticalAlign: -1, marginRight: 3 }} />
                            {stats.def}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                          <span className="text-gray-400">Brass Keys:</span>
                          <span style={{ color: C.boneDim }}>
                            <Key size={11} style={{ inlineSize: 11, display: "inline", verticalAlign: -1, marginRight: 3 }} />
                            {keyCount}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="text-gray-400">Ash Gold:</span>
                          <span style={{ color: C.gold, fontWeight: "bold" }}>
                            <Coins size={11} style={{ inlineSize: 11, display: "inline", verticalAlign: -1, marginRight: 3 }} />
                            {stats.gold}g
                          </span>
                        </div>
                      </div>

                      {/* Equipped Relics (Batch 2) */}
                      <div style={{
                        marginTop: 10,
                        borderTop: `1px dashed ${C.border}`,
                        paddingTop: 8,
                        marginBottom: 10
                      }}>
                        <div style={{ fontSize: 9, color: C.gold, fontWeight: "bold", letterSpacing: "0.05em", marginBottom: 6 }}>
                          🛡️ ACTIVE PASSIVE RELICS (MAX 2):
                        </div>
                        {equippedRelics.length === 0 ? (
                          <div style={{ fontSize: 9, color: C.boneDim, opacity: 0.5, fontStyle: "italic" }}>
                            No active relics. Buy relics from Gideon the merchant, then click them in your satchel to equip!
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {equippedRelics.map((rel, rIdx) => (
                              <div
                                key={rIdx}
                                style={{
                                  background: "#161210",
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 4,
                                  padding: "4px 6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  fontSize: 9.5
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span>{rel.icon}</span>
                                  <span style={{ fontWeight: "bold", color: C.bone }}>{rel.name}</span>
                                </span>
                                <button
                                  onClick={() => unequipRelic(rIdx)}
                                  title="Unequip relic to satchel"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: C.bloodBright,
                                    cursor: "pointer",
                                    fontSize: 8,
                                    padding: "0 2px",
                                    fontWeight: "bold"
                                  }}
                                >
                                  ✖
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Backstory card */}
                    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 5, padding: 10, fontSize: 10, color: C.boneDim, lineHeight: 1.5 }}>
                      <div style={{ color: C.gold, fontFamily: SERIF, fontSize: 11, marginBottom: 4 }}>THE VANGUARD'S QUEST</div>
                      {cls.backstory.slice(0, 110)}...
                    </div>
                  </div>

                  {/* CENTER PANEL: THE VIEWPORT AND MOVEMENT/BATTLE WINDOW (COL SPAN 5) */}
                  <div
                    className="md:col-span-5"
                    style={{
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 16,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* EXPLORATION MODE ON DESKTOP */}
                    {screen === "explore" && (
                      <div style={{ width: "100%" }}>
                        {/* Floor Affix & Region Status Banner (Batch 2) */}
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                          background: "#161210",
                          border: `1.5px solid ${floorAffix ? "#cc8a2c" : C.border}`,
                          padding: "6px 10px",
                          borderRadius: 4,
                          boxShadow: floorAffix ? "0 0 10px rgba(204, 138, 44, 0.15)" : "none"
                        }}>
                          <div>
                            <div style={{ fontSize: 9, color: C.gold, fontWeight: "bold", letterSpacing: "0.05em" }}>
                              CURRENT REGION:
                            </div>
                            <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: "bold", color: C.bone }}>
                              {inSecret ? "🌀 Secret Void Rift" : FLOOR_META[floor].name}
                            </div>
                          </div>
                          {floorAffix && !inSecret && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 9, color: "#ff8a80", fontWeight: "bold", letterSpacing: "0.05em" }}>
                                ⚠️ ACTIVE LEVEL AFFIX:
                              </div>
                              <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: "bold", color: "#ff8a80" }} title={floorAffix.desc}>
                                {floorAffix.name}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* View Mode Toggle Switch */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                          <button
                            onClick={() => setThreeDEnabled(!threeDEnabled)}
                            style={{
                              background: "linear-gradient(180deg, #2a221d 0%, #1c1511 100%)",
                              border: `1.5px solid ${threeDEnabled ? C.gold : C.border}`,
                              boxShadow: threeDEnabled ? `0 0 10px ${C.gold}30` : "none",
                              borderRadius: 4,
                              padding: "5px 10px",
                              color: threeDEnabled ? C.gold : C.bone,
                              fontSize: 9.5,
                              fontWeight: "bold",
                              fontFamily: MONO,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.25s ease",
                            }}
                          >
                            <span>{threeDEnabled ? "📐 DIORAMA 3D" : "📺 RETRO 2D"}</span>
                            <span style={{ fontSize: 9, opacity: 0.7 }}>[TOGGLE]</span>
                          </button>
                        </div>

                        <div
                          style={{
                            position: "relative",
                            background: C.bg,
                            border: `2px solid ${C.border}`,
                            borderRadius: 6,
                            padding: threeDEnabled ? "48px 32px" : 8,
                            aspectRatio: "1",
                            width: "100%",
                            overflow: threeDEnabled ? "visible" : "hidden",
                            perspective: "1200px",
                            perspectiveOrigin: threeDEnabled ? "50% 30%" : "50% 50%",
                            transformStyle: "preserve-3d",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {/* Weather Particles overlay */}
                          <ParticleSystem count={18} />

                          {/* Map Grid */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${inSecret ? 5 : GRID_SIZE}, 1fr)`,
                              gap: 2,
                              width: "100%",
                              height: "100%",
                              transformStyle: "preserve-3d",
                              transform: threeDEnabled
                                ? "rotateX(53deg) rotateZ(-45deg) translateY(-14%) translateX(2%) scale3d(0.88, 0.88, 0.88)"
                                : "none",
                              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                          >
                            {(inSecret ? mapData?.secretRoom.grid : mapData?.grid)?.map((row, y) =>
                              row.map((tile, x) => {
                                const k = key(x, y);
                                const isVisited = inSecret ? true : visited.has(k);
                                const dist = Math.abs(pos[0] - x) + Math.abs(pos[1] - y);
                                const glow = inSecret ? 1 : dist <= VIEW_RADIUS ? 1 : isVisited ? 0.35 : 0;

                                const isPlayerHere = pos[0] === x && pos[1] === y;
                                const visual = (isPlayerHere && threeDEnabled) ? (
                                  <div
                                    style={{
                                      width: 32,
                                      height: 40,
                                      filter: `drop-shadow(0 0 8px ${cls?.accent || "#ff4444"})`,
                                      animation: playerAnim === "walk" ? "walkBob 0.2s ease" : "floatIdle 2s ease-in-out infinite",
                                      zIndex: 40,
                                    }}
                                  >
                                    <ClassSprite classKey={cls?.key || "vanguard"} accent={cls?.accent || "#ff4444"} />
                                  </div>
                                ) : inSecret
                                  ? tile === "secret-item"
                                    ? <ItemIcon item={mapData?.secretRoom.item} />
                                    : tile === "portal-back"
                                    ? <PortalIcon />
                                    : null
                                  : tileVisual(tile, k);

                                return (
                                  <TerrainCell
                                    key={k}
                                    tile={tile}
                                    x={x}
                                    y={y}
                                    isVisited={isVisited}
                                    glow={glow}
                                    visual={visual}
                                    onClick={() => handleTileClick(x, y)}
                                    threeD={threeDEnabled}
                                  />
                                );
                              })
                            )}
                          </div>

                          {/* Player Character Overlay Marker */}
                          {!threeDEnabled && (
                            <div
                              style={{
                                position: "absolute",
                                left: `calc(8px + ${(pos[0] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${
                                  100 / (inSecret ? 5 : GRID_SIZE) / 2
                                }%)`,
                                top: `calc(8px + ${(pos[1] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${
                                  100 / (inSecret ? 5 : GRID_SIZE) / 2
                                }%)`,
                                transform: "translate(-50%, -50%)",
                                transition: "left 0.16s ease, top 0.16s ease",
                                width: 32,
                                height: 40,
                                filter: `drop-shadow(0 0 6px ${cls?.accent || "#ff4444"})`,
                                pointerEvents: "none",
                                zIndex: 30,
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  animation:
                                    playerAnim === "walk"
                                      ? "walkBob 0.2s ease"
                                      : "floatIdle 2s ease-in-out infinite",
                                }}
                              >
                                <ClassSprite classKey={cls?.key || "vanguard"} accent={cls?.accent || "#ff4444"} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tactical Movement Controls */}
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "44px 44px 44px",
                              gridTemplateRows: "38px 38px 38px",
                              gap: 6,
                            }}
                          >
                            <div />
                            <button
                              onClick={() => (inSecret ? moveInSecret : movePlayer)(0, -1)}
                              style={dpadBtnStyle()}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <div />
                            <button
                              onClick={() => (inSecret ? moveInSecret : movePlayer)(-1, 0)}
                              style={dpadBtnStyle()}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: C.borderBright,
                              }}
                            >
                              <Flame size={14} />
                            </div>
                            <button
                              onClick={() => (inSecret ? moveInSecret : movePlayer)(1, 0)}
                              style={dpadBtnStyle()}
                            >
                              <ChevronRight size={16} />
                            </button>
                            <div />
                            <button
                              onClick={() => (inSecret ? moveInSecret : movePlayer)(0, 1)}
                              style={dpadBtnStyle()}
                            >
                              <ChevronDown size={16} />
                            </button>
                            <div />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MERCHANDISE SHOP VIEW ON DESKTOP */}
                    {screen === "shop" && (
                      <div
                        className="animate-[fadeInUp_0.3s_ease] w-full"
                        style={{
                          background: C.panel2,
                          border: `1px solid ${C.gold}60`,
                          borderRadius: 6,
                          padding: 16,
                          minHeight: 320,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ textAlign: "center", marginBottom: 14 }}>
                            <div style={{ fontSize: 24 }}>⚖️</div>
                            <div style={{ fontFamily: SERIF, fontSize: 16, color: C.gold, fontWeight: "bold" }}>
                              The Hooded Scavenger
                            </div>
                            <div style={{ fontSize: 10, color: C.boneDim }}>
                              'Everything belongs to the cinders. Until you buy it.'
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {shopOffers.map((o, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 10px",
                                  background: C.panel,
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 5,
                                }}
                              >
                                <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ width: 18, height: 18 }}>
                                    <ItemIcon item={o.item} />
                                  </span>
                                  {o.item.name}
                                </span>
                                <button
                                  onClick={() => buyItem(o)}
                                  style={{
                                    background: stats.gold >= o.cost ? C.blood : C.bg,
                                    color: C.bone,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 4,
                                    padding: "4px 10px",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontFamily: MONO,
                                  }}
                                  disabled={stats.gold < o.cost}
                                >
                                  {o.cost}g
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setScreen("explore")}
                          style={{
                            background: C.slate,
                            color: C.bone,
                            border: "none",
                            borderRadius: 4,
                            padding: "8px",
                            fontSize: 12,
                            cursor: "pointer",
                            width: "100%",
                            marginTop: 14,
                          }}
                        >
                          Return to Exploration
                        </button>
                      </div>
                    )}

                    {/* COMBAT VIEW ON DESKTOP */}
                    {screen === "combat" && combat && (
                      <div
                        className="animate-[fadeInUp_0.3s_ease] w-full"
                        style={{
                          background: C.panel2,
                          border: `2px solid ${C.blood}`,
                          borderRadius: 6,
                          padding: 16,
                          minHeight: 320,
                        }}
                      >
                        {/* Battle arena stage */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "flex-end",
                            background: C.bg,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            padding: "24px 12px",
                            marginBottom: 16,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
          {/* FLOATING DAMAGE NUMBERS SYSTEM OVERLAY */}
          {damageNumbers.map((dn) => (
            <div
              key={dn.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                transform: "translate(-50%, -50%)",
                color: dn.color,
                fontWeight: "bold",
                fontFamily: MONO,
                fontSize: dn.crit ? 28 : 20,
                textShadow: "0 0 8px #000, 0 0 15px rgba(0,0,0,0.9)",
                pointerEvents: "none",
                zIndex: 120,
                animation: "floatDmg 0.9s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards",
              }}
            >
              {dn.text}
            </div>
          ))}

           {/* Slashes Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {playerAnim === "attack" && (
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "45%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 100,
                }}
              >
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ animation: "swordSlashArc 0.28s ease-out forwards" }}>
                  <path d="M10,90 Q50,10 90,10" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" filter="drop-shadow(0 0 8px #ffd700)" />
                  <path d="M15,85 Q50,20 85,15" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
            )}
            {enemyAnim === "attack" && (
              <div
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "25%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 100,
                }}
              >
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ animation: "swordSlashArc 0.28s ease-out forwards" }}>
                  <path d="M20,20 L80,80 M40,20 L100,80 M0,20 L60,80" fill="none" stroke="#ff3333" strokeWidth="5" strokeLinecap="round" opacity="0.95" filter="drop-shadow(0 0 6px #ff0000)" />
                </svg>
              </div>
            )}
          </div>

          {/* Player Side */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 58,
                height: 74,
                animation: combatIntro
                  ? "walkInPlayer 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                  : playerAnim === "attack"
                  ? "lungeRight 0.26s ease"
                  : playerAnim === "hurt"
                  ? "hurtShake 0.3s ease"
                  : "floatIdle 2.2s ease-in-out infinite",
              }}
            >
              <ClassSprite classKey={cls.key} accent={cls.accent} />
            </div>

            {/* Player active combat buffs & status effects */}
            <div style={{ display: "flex", gap: 3, minHeight: 14 }}>
              {playerBleeding > 0 && (
                <span style={{ fontSize: 8, fontFamily: MONO, background: `${C.blood}99`, color: "#fff", padding: "1px 4px", borderRadius: 3, border: `1.5px solid ${C.bloodBright}` }}>
                  🩸 BLEED({playerBleeding})
                </span>
              )}
              {playerEnergized > 0 && (
                <span style={{ fontSize: 8, fontFamily: MONO, background: "rgba(100,149,237,0.6)", color: "#fff", padding: "1px 4px", borderRadius: 3, border: "1.5px solid cornflowerblue" }}>
                  ⚡ ENERGIZED({playerEnergized})
                </span>
              )}
            </div>
          </div>

          {/* Combat Sparks */}
          <div style={{ color: C.borderBright, fontSize: 24, paddingBottom: 14 }}>VS</div>

          {/* Enemy Side */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              position: "relative",
            }}
          >
            {/* Enemy Intent Badge hovering above enemy */}
            {enemyIntent && (
              <div
                style={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#0c0a09",
                  border: `1.5px solid ${enemyIntent.type === "attack" ? C.bloodBright : enemyIntent.type === "block" ? C.moss : C.gold}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 8.5,
                  fontFamily: MONO,
                  color: C.bone,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  zIndex: 10,
                }}
              >
                <span>
                  {enemyIntent.type === "attack" && "⚔️"}
                  {enemyIntent.type === "block" && "🛡️"}
                  {enemyIntent.type === "spell" && "🔮"}
                  {enemyIntent.type === "debuff" && "💀"}
                </span>
                <span>{enemyIntent.name}</span>
              </div>
            )}

            <div
              style={{
                width: combat.enemy.boss ? 80 : 62,
                height: combat.enemy.boss ? 94 : 74,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  animation: combatIntro
                    ? "walkInEnemy 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                    : enemyAnim === "attack"
                    ? "lungeLeft 0.26s ease"
                    : enemyAnim === "hurt"
                    ? "hurtShake 0.3s ease"
                    : enemyAnim === "dead"
                    ? "deathFade 0.5s ease forwards"
                    : "floatIdle 2.5s ease-in-out infinite",
                }}
              >
                <EnemySprite enemy={combat.enemy} />
              </div>
              {enemyAnim === "hurt" && (
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: "50%",
                    animation: "hitFlash 0.3s ease",
                  }}
                />
              )}
            </div>

            {/* Enemy status effects */}
            <div style={{ display: "flex", gap: 3, minHeight: 14 }}>
              {enemyBleeding > 0 && (
                <span style={{ fontSize: 8, fontFamily: MONO, background: `${C.blood}99`, color: "#fff", padding: "1px 4px", borderRadius: 3, border: `1.5px solid ${C.bloodBright}` }}>
                  🩸 BLEED({enemyBleeding})
                </span>
              )}
              {enemyStunned > 0 && (
                <span style={{ fontSize: 8, fontFamily: MONO, background: "rgba(218,165,32,0.6)", color: "#fff", padding: "1px 4px", borderRadius: 3, border: "1.5px solid gold" }}>
                  ⚡ STUNNED({enemyStunned})
                </span>
              )}
            </div>
          </div>
        </div>

                        {/* Enemy Stats bar */}
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: "bold" }}>
                            {combat.enemy.name}
                          </div>
                          <div
                            style={{
                              background: "#000",
                              borderRadius: 3,
                              height: 6,
                              overflow: "hidden",
                              margin: "6px auto",
                            }}
                          >
                            <div
                              style={{
                                width: `${enemyHpPct}%`,
                                height: "100%",
                                background: C.bloodBright,
                                transition: "width 0.25s ease",
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 10, color: C.boneDim }}>
                            HP {combat.enemy.curHp}/{combat.enemy.hp}
                          </div>
                        </div>

                        {/* Action Buttons list */}
                        {actionMenu === "main" && (
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={playerAttack} style={combatBtnStyle(C.blood)}>
                              <Sword size={13} style={{ marginRight: 4, display: "inline" }} />
                              Attack
                            </button>
                            <button
                              onClick={() => setActionMenu("skills")}
                              style={combatBtnStyle(cls.accent)}
                            >
                              <Sparkles size={13} style={{ marginRight: 4, display: "inline" }} />
                              Skills
                            </button>
                            <button onClick={playerDefend} style={combatBtnStyle(C.slate)}>
                              <Shield size={13} style={{ marginRight: 4, display: "inline" }} />
                              Defend
                            </button>
                            <button
                              onClick={() => setActionMenu("items")}
                              style={combatBtnStyle(C.moss)}
                            >
                              <FlaskConical size={13} style={{ marginRight: 4, display: "inline" }} />
                              Item
                            </button>
                            <button
                              onClick={playerFlee}
                              style={{
                                ...combatBtnStyle(C.panel),
                                border: `1px solid ${C.border}`,
                                gridColumn: "1 / span 2",
                              }}
                            >
                              Flee Back
                            </button>
                          </div>
                        )}

                        {actionMenu === "skills" && (
                          <div className="flex flex-col gap-2">
                            {cls.skills.map((sk) => (
                              <button
                                key={sk.id}
                                disabled={stats.focus < sk.cost}
                                onClick={() => useSkill(sk.id)}
                                style={{
                                  background: C.panel,
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 5,
                                  color: C.bone,
                                  padding: "8px 12px",
                                  fontSize: 11,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  opacity: stats.focus < sk.cost ? 0.4 : 1,
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                                  <span>{sk.icon} {sk.name}</span>
                                  <span style={{ color: cls.accent }}>Cost: {sk.cost}◆</span>
                                </div>
                                <div style={{ fontSize: 9, color: C.boneDim, marginTop: 2 }}>{sk.desc}</div>
                              </button>
                            ))}
                            <button
                              disabled={stats.hp <= 8}
                              onClick={performFocusSurge}
                              style={{
                                background: "#2e1212",
                                border: `1.5px solid ${C.bloodBright}`,
                                borderRadius: 5,
                                color: C.bone,
                                padding: "8px 12px",
                                fontSize: 11,
                                cursor: stats.hp <= 8 ? "not-allowed" : "pointer",
                                textAlign: "left",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontWeight: "bold",
                                opacity: stats.hp <= 8 ? 0.4 : 1,
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span>⚡</span>
                                <span>Focus Surge</span>
                              </span>
                              <span style={{ color: "#ff8a80", fontSize: 10 }}>Cost: -8 HP (Gain +2 Focus)</span>
                            </button>
                            <button
                              onClick={() => setActionMenu("main")}
                              style={{
                                background: C.slate,
                                color: C.bone,
                                border: "none",
                                borderRadius: 4,
                                padding: "6px",
                                fontSize: 11,
                                cursor: "pointer",
                              }}
                            >
                              Back
                            </button>
                          </div>
                        )}

                        {actionMenu === "items" && (
                          <div className="flex flex-col gap-2">
                            {inventory.filter((it) => it.type === "potion" || it.type === "scroll" || it.type === "focus").length === 0 ? (
                              <div style={{ fontSize: 11, color: C.boneDim, textAlign: "center", padding: 10 }}>
                                No battle consumables found.
                              </div>
                            ) : (
                              inventory.map((it, idx) => {
                                if (it.type !== "potion" && it.type !== "scroll" && it.type !== "focus") return null;
                                return (
                                  <div key={idx} style={{
                                    background: C.panel,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 4,
                                    padding: "6px 10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                  }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, flex: 1 }}>
                                      <span style={{ width: 14, height: 14 }}>
                                        <ItemIcon item={it} />
                                      </span>
                                      <span style={{ fontWeight: "bold" }}>{it.name}</span>
                                    </span>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      <button
                                        onClick={() => useConsumable(idx, true)}
                                        style={{
                                          background: "#16201a",
                                          border: "1px solid #1c3524",
                                          borderRadius: 3,
                                          padding: "4px 8px",
                                          color: "#4caf50",
                                          fontSize: 9,
                                          cursor: "pointer",
                                          fontFamily: MONO,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {it.type === "potion" ? "🧪 Drink" : it.type === "scroll" ? "📜 Read" : "🔷 Channel"}
                                      </button>
                                      <button
                                        onClick={() => throwConsumable(idx)}
                                        style={{
                                          background: "#221313",
                                          border: "1px solid #3c1e1e",
                                          borderRadius: 3,
                                          padding: "4px 8px",
                                          color: "#ff8a80",
                                          fontSize: 9,
                                          cursor: "pointer",
                                          fontFamily: MONO,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        🎯 Hurl
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <button
                              onClick={() => setActionMenu("main")}
                              style={{
                                background: C.slate,
                                color: C.bone,
                                border: "none",
                                borderRadius: 4,
                                padding: "6px",
                                fontSize: 11,
                                cursor: "pointer",
                              }}
                            >
                              Back
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT PANEL: SATCHEL, DISCOVERED JOURNAL AND CHRONICLES LOG (COL SPAN 4) */}
                  <div
                    className="md:col-span-4"
                    style={{
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 16,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {/* SATCHEL ITEMS */}
                    <div style={{ flex: "1 1 0%" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.boneDim,
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          letterSpacing: "0.05em",
                        }}
                      >
                        <Package size={12} />
                        SATCHEL DISPATCH
                      </div>

                      {inventory.length === 0 ? (
                        <div
                          style={{
                            fontSize: 10,
                            color: C.boneDim,
                            opacity: 0.6,
                            background: C.panel2,
                            borderRadius: 5,
                            padding: 12,
                            textAlign: "center",
                          }}
                        >
                          Empty. Traverse chambers to discover health elixirs, focus vials, and dynamic scrolls.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 110, overflowY: "auto" }}>
                          {inventory.map((it, idx) => (
                            <button
                              key={idx}
                              onClick={() => useConsumable(idx, false)}
                              style={{
                                background: C.panel2,
                                border: `1px solid ${C.border}`,
                                borderRadius: 4,
                                color: C.bone,
                                fontSize: 10,
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontFamily: MONO,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                            >
                              <span style={{ width: 14, height: 14 }}>
                                <ItemIcon item={it} />
                              </span>
                              {it.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* DISCOVERED LORE JOURNAL (WORLD BUILDING ELEMENT) */}
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, flex: "1.2 1 0%" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.gold,
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          letterSpacing: "0.05em",
                        }}
                      >
                        <BookOpen size={12} />
                        DISCOVERED CHRONICLES
                      </div>

                      {unlockedLore.length === 0 ? (
                        <div style={{ fontSize: 10, color: C.boneDim, opacity: 0.5, fontStyle: "italic", lineHeight: 1.5 }}>
                          No manuscripts deciphered. Investigate the dusty stone ledger nodes in the rooms to unlock the history of Ashveil.
                        </div>
                      ) : (
                        <div
                          style={{
                            maxHeight: 110,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            paddingRight: 4,
                          }}
                        >
                          {unlockedLore.map((lr, idx) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: 9.5,
                                color: C.bone,
                                background: C.panel2,
                                borderRadius: 4,
                                padding: "6px 8px",
                                borderLeft: `2px solid ${C.gold}`,
                                lineHeight: 1.4,
                              }}
                            >
                              "{lr}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* INTERACTIVE LOGS */}
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, flex: "1 1 0%" }}>
                      <div style={{ fontSize: 10, color: C.boneDim, marginBottom: 5, letterSpacing: "0.05em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>SYSTEM CHRONICLE</span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: C.gold, display: "flex", gap: 8 }}>
                          <span title="Enemies Defeated">⚔️ {statsKills}</span>
                          <span title="Steps Taken">👣 {statsSteps}</span>
                          <span title="Secret Rifts Entered">🌀 {statsSecretRooms}</span>
                          <span title="Gold Spent">💰 {statsGoldSpent}</span>
                        </span>
                      </div>
                      <div
                        ref={logRef}
                        style={{
                          background: "#020202",
                          border: `1px solid ${C.border}`,
                          borderRadius: 5,
                          padding: 8,
                          height: 100,
                          overflowY: "auto",
                          fontSize: 10.5,
                          color: C.boneDim,
                          lineHeight: 1.5,
                        }}
                      >
                        {log.map((line, idx) => (
                          <div key={idx} style={{ animation: "fadeInUp 0.2s ease" }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================================== */}
                {/* Mobile Tabbed View (Shown only on small screens) */}
                <div className="md:hidden block">
                  
                  {/* Tab bar navigation */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      marginBottom: 12,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setMobileTab("map")}
                      style={mobileTabStyle("map", mobileTab)}
                    >
                      <Compass size={14} style={{ inlineSize: 14, display: "inline", marginRight: 4 }} />
                      Map
                    </button>
                    <button
                      onClick={() => setMobileTab("status")}
                      style={mobileTabStyle("status", mobileTab)}
                    >
                      <User size={14} style={{ inlineSize: 14, display: "inline", marginRight: 4 }} />
                      Hero
                    </button>
                    <button
                      onClick={() => setMobileTab("inventory")}
                      style={mobileTabStyle("inventory", mobileTab)}
                    >
                      <Package size={14} style={{ inlineSize: 14, display: "inline", marginRight: 4 }} />
                      Satchel
                    </button>
                  </div>

                  {/* Mobile Map Tab */}
                  {mobileTab === "map" && (
                    <div className="animate-[fadeInUp_0.2s_ease]">
                      {screen === "explore" && (
                        <div>
                          {/* View Mode Toggle Switch on Mobile */}
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                            <button
                              onClick={() => setThreeDEnabled(!threeDEnabled)}
                              style={{
                                background: "linear-gradient(180deg, #2a221d 0%, #1c1511 100%)",
                                border: `1px solid ${threeDEnabled ? C.gold : C.border}`,
                                borderRadius: 4,
                                padding: "4px 8px",
                                color: threeDEnabled ? C.gold : C.bone,
                                fontSize: 9,
                                fontWeight: "bold",
                                fontFamily: MONO,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <span>{threeDEnabled ? "📐 3D" : "📺 2D"}</span>
                            </button>
                          </div>

                          <div
                            style={{
                              position: "relative",
                              background: C.bg,
                              border: `2px solid ${C.border}`,
                              borderRadius: 6,
                              padding: threeDEnabled ? "36px 24px" : 6,
                              aspectRatio: "1",
                              width: "100%",
                              overflow: threeDEnabled ? "visible" : "hidden",
                              perspective: "1200px",
                              perspectiveOrigin: threeDEnabled ? "50% 30%" : "50% 50%",
                              transformStyle: "preserve-3d",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <ParticleSystem count={12} />
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${inSecret ? 5 : GRID_SIZE}, 1fr)`,
                                gap: 2,
                                width: "100%",
                                height: "100%",
                                transformStyle: "preserve-3d",
                                transform: threeDEnabled
                                  ? "rotateX(53deg) rotateZ(-45deg) translateY(-14%) translateX(2%) scale3d(0.88, 0.88, 0.88)"
                                  : "none",
                                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                              }}
                            >
                              {(inSecret ? mapData?.secretRoom.grid : mapData?.grid)?.map((row, y) =>
                                row.map((tile, x) => {
                                  const k = key(x, y);
                                  const isVisited = inSecret ? true : visited.has(k);
                                  const dist = Math.abs(pos[0] - x) + Math.abs(pos[1] - y);
                                  const glow = inSecret ? 1 : dist <= VIEW_RADIUS ? 1 : isVisited ? 0.35 : 0;
                                  
                                  const isPlayerHere = pos[0] === x && pos[1] === y;
                                  const visual = (isPlayerHere && threeDEnabled) ? (
                                    <div
                                      style={{
                                        width: 28,
                                        height: 36,
                                        filter: `drop-shadow(0 0 6px ${cls?.accent || "#ff4444"})`,
                                        animation: playerAnim === "walk" ? "walkBob 0.2s ease" : "floatIdle 2s ease-in-out infinite",
                                        zIndex: 40,
                                      }}
                                    >
                                      <ClassSprite classKey={cls?.key || "vanguard"} accent={cls?.accent || "#ff4444"} />
                                    </div>
                                  ) : inSecret
                                    ? tile === "secret-item"
                                      ? <ItemIcon item={mapData?.secretRoom.item} />
                                      : tile === "portal-back"
                                      ? <PortalIcon />
                                      : null
                                    : tileVisual(tile, k);

                                  return (
                                    <TerrainCell
                                      key={k}
                                      tile={tile}
                                      x={x}
                                      y={y}
                                      isVisited={isVisited}
                                      glow={glow}
                                      visual={visual}
                                      onClick={() => handleTileClick(x, y)}
                                      threeD={threeDEnabled}
                                    />
                                  );
                                })
                              )}
                            </div>

                            {/* Player Character Overlay Marker */}
                            {!threeDEnabled && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: `calc(6px + ${(pos[0] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${
                                    100 / (inSecret ? 5 : GRID_SIZE) / 2
                                  }%)`,
                                  top: `calc(6px + ${(pos[1] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${
                                    100 / (inSecret ? 5 : GRID_SIZE) / 2
                                  }%)`,
                                  transform: "translate(-50%, -50%)",
                                  transition: "left 0.15s ease, top 0.15s ease",
                                  width: 28,
                                  height: 36,
                                  filter: `drop-shadow(0 0 5px ${cls?.accent || "#ff4444"})`,
                                  pointerEvents: "none",
                                }}
                              >
                                <div style={{ width: "100%", height: "100%", animation: "floatIdle 2s infinite" }}>
                                  <ClassSprite classKey={cls?.key || "vanguard"} accent={cls?.accent || "#ff4444"} />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Dpad */}
                          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "44px 44px 44px", gridTemplateRows: "38px 38px 38px", gap: 6 }}>
                              <div />
                              <button onClick={() => (inSecret ? moveInSecret : movePlayer)(0, -1)} style={dpadBtnStyle()}><ChevronUp size={16} /></button>
                              <div />
                              <button onClick={() => (inSecret ? moveInSecret : movePlayer)(-1, 0)} style={dpadBtnStyle()}><ChevronLeft size={16} /></button>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: C.border }}><Flame size={12} /></div>
                              <button onClick={() => (inSecret ? moveInSecret : movePlayer)(1, 0)} style={dpadBtnStyle()}><ChevronRight size={16} /></button>
                              <div />
                              <button onClick={() => (inSecret ? moveInSecret : movePlayer)(0, 1)} style={dpadBtnStyle()}><ChevronDown size={16} /></button>
                              <div />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Combat or Shop view placeholder for mobile under Map Tab */}
                      {screen === "shop" && (
                        <div
                          style={{
                            background: C.panel,
                            border: `1px solid ${C.gold}50`,
                            borderRadius: 6,
                            padding: 12,
                          }}
                        >
                          <div style={{ textAlign: "center", marginBottom: 10 }}>
                            <div style={{ fontSize: 20 }}>⚖️</div>
                            <div style={{ fontFamily: SERIF, fontSize: 15, color: C.gold, fontWeight: "bold" }}>Gideon the Merchant</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {shopOffers.map((o, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: 8, background: C.panel2, borderRadius: 4 }}>
                                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>{o.item.name}</span>
                                <button onClick={() => buyItem(o)} disabled={stats.gold < o.cost} style={{ background: C.blood, border: "none", color: "#fff", padding: "4px 8px", fontSize: 10, borderRadius: 3 }}>{o.cost}g</button>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setScreen("explore")} style={{ ...combatBtnStyle(C.slate), marginTop: 10, width: "100%" }}>Leave Shop</button>
                        </div>
                      )}

                      {screen === "combat" && combat && (
                        <div style={{ background: C.panel, border: `2px solid ${C.blood}`, borderRadius: 6, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: 10, background: C.bg, borderRadius: 5, marginBottom: 10 }}>
                            <div style={{ width: 44, height: 56, animation: "floatIdle 2s infinite" }}><ClassSprite classKey={cls.key} accent={cls.accent} /></div>
                            <div style={{ fontSize: 16 }}>vs</div>
                            <div style={{ width: 44, height: 56, animation: "floatIdle 2s infinite" }}><EnemySprite enemy={combat.enemy} /></div>
                          </div>
                          <div style={{ textAlign: "center", marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: "bold" }}>{combat.enemy.name}</div>
                            <div style={{ background: "#000", height: 4, borderRadius: 2, overflow: "hidden", margin: "4px 0" }}>
                              <div style={{ width: `${enemyHpPct}%`, height: "100%", background: C.bloodBright }} />
                            </div>
                            <div style={{ fontSize: 9, color: C.boneDim }}>HP {combat.enemy.curHp}/{combat.enemy.hp}</div>
                          </div>

                          {/* Action Buttons list */}
                          {actionMenu === "main" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={playerAttack} style={combatBtnStyle(C.blood)}>Attack</button>
                              <button onClick={() => setActionMenu("skills")} style={combatBtnStyle(cls.accent)}>Skills</button>
                              <button onClick={playerDefend} style={combatBtnStyle(C.slate)}>Defend</button>
                              <button onClick={() => setActionMenu("items")} style={combatBtnStyle(C.moss)}>Item</button>
                            </div>
                          )}

                          {actionMenu === "skills" && (
                            <div className="flex flex-col gap-1.5">
                              {cls.skills.map((sk) => (
                                <button key={sk.id} disabled={stats.focus < sk.cost} onClick={() => useSkill(sk.id)} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 4, padding: 6, textAlign: "left", fontSize: 10.5, color: "#fff", display: "flex", justifyContent: "space-between" }}>
                                  <span>{sk.icon} {sk.name}</span>
                                  <span style={{ color: cls.accent }}>{sk.cost}◆</span>
                                </button>
                              ))}
                              <button onClick={() => setActionMenu("main")} style={{ ...combatBtnStyle(C.slate), padding: 4 }}>Back</button>
                            </div>
                          )}

                          {actionMenu === "items" && (
                            <div className="flex flex-col gap-1.5">
                              {inventory.filter((it) => it.type === "potion" || it.type === "scroll" || it.type === "focus").length === 0 ? (
                                <div style={{ fontSize: 10, color: C.boneDim, textAlign: "center", padding: 8 }}>Empty.</div>
                              ) : (
                                inventory.map((it, idx) => (
                                  <button key={idx} onClick={() => useConsumable(idx, true)} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 4, padding: 6, textAlign: "left", fontSize: 10, color: "#fff" }}>
                                    {it.name}
                                  </button>
                                ))
                              )}
                              <button onClick={() => setActionMenu("main")} style={{ ...combatBtnStyle(C.slate), padding: 4 }}>Back</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Hero Status Tab */}
                  {mobileTab === "status" && (
                    <div className="animate-[fadeInUp_0.2s_ease] bg-[#14100d] p-4 rounded-md border border-[#3a2e26]">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 44 }}><ClassSprite classKey={cls.key} accent={cls.accent} /></div>
                        <div>
                          <div style={{ fontFamily: SERIF, fontSize: 16, color: cls.accent, fontWeight: "bold" }}>{cls.name}</div>
                          <div style={{ fontSize: 10, color: C.boneDim }}>{cls.title}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <span>Level:</span><span>{stats.level}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <span>Health:</span><span>{stats.hp}/{stats.maxHp}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <span>ATK Damage:</span><span>{stats.atk}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <span>DEF Defense:</span><span>{stats.def}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                          <span>Keys:</span><span>{keyCount}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Soot Gold:</span><span style={{ color: C.gold }}>{stats.gold}g</span>
                        </div>
                      </div>

                      {/* CONQUEST RECORDS SUBSECTION */}
                      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 12 }}>
                        <div style={{ fontSize: 10, color: C.gold, marginBottom: 8, fontFamily: SERIF, fontWeight: "bold", letterSpacing: "0.05em" }}>⚔️ CONQUEST RECORDS</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 10, fontFamily: MONO, color: C.boneDim }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Kills:</span><span style={{ color: C.bone }}>{statsKills}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Steps:</span><span style={{ color: C.bone }}>{statsSteps}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Rifts:</span><span style={{ color: C.bone }}>{statsSecretRooms}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Shrines:</span><span style={{ color: C.bone }}>{statsShrines}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Potions:</span><span style={{ color: C.bone }}>{statsPotionsDrunk}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Spent:</span><span style={{ color: C.gold }}>{statsGoldSpent}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Satchel Tab */}
                  {mobileTab === "inventory" && (
                    <div className="animate-[fadeInUp_0.2s_ease] bg-[#14100d] p-4 rounded-md border border-[#3a2e26] flex flex-col gap-4">
                      <div>
                        <div style={{ fontSize: 11, color: C.gold, marginBottom: 6, fontWeight: "bold" }}>SATCHEL ITEMS</div>
                        {inventory.length === 0 ? (
                          <div style={{ fontSize: 10, color: C.boneDim, opacity: 0.6 }}>No items.</div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {inventory.map((it, idx) => (
                              <button key={idx} onClick={() => useConsumable(idx, false)} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 4, color: "#fff", fontSize: 10, padding: "5px 8px" }}>
                                {it.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <div style={{ fontSize: 11, color: C.gold, marginBottom: 6, fontWeight: "bold" }}>MANUSCRIPTS</div>
                        {unlockedLore.length === 0 ? (
                          <div style={{ fontSize: 10, color: C.boneDim, opacity: 0.5 }}>No lore logs decrypted.</div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {unlockedLore.map((lr, idx) => (
                              <div key={idx} style={{ fontSize: 9.5, color: C.bone, padding: 5, background: C.panel2, borderLeft: `2px solid ${C.gold}` }}>
                                "{lr}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interactive logs for Mobile shown on Map view */}
                  {mobileTab === "map" && (
                    <div style={{ marginTop: 12 }}>
                      <div ref={logRef} style={{ background: "#020202", border: `1px solid ${C.border}`, borderRadius: 5, padding: 6, height: 80, overflowY: "auto", fontSize: 10, color: C.boneDim }}>
                        {log.map((line, idx) => <div key={idx}>{line}</div>)}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* Footer info credit */}
        <footer
          style={{
            marginTop: 20,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 9.5,
            color: C.boneDim,
          }}
        >
          <span>Ashveil RPG v1.2.0 · Designed for Keyboard (Arrow/WASD) & Touch</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            Licensed under Gothic Sandbox
            <ExternalLink size={8} />
          </span>
        </footer>
      </div>
    </div>
  );
}

// Visual helpers for layouts
function dpadBtnStyle(): React.CSSProperties {
  return {
    width: 44,
    height: 38,
    background: "#1c1613",
    border: `1px solid ${C.border}`,
    borderRadius: 5,
    color: C.bone,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
  };
}

function combatBtnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    border: "none",
    borderRadius: 5,
    color: C.bone,
    padding: "8px 10px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: MONO,
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  };
}

function mobileTabStyle(key: string, activeKey: string): React.CSSProperties {
  const active = key === activeKey;
  return {
    flex: 1,
    background: active ? C.panel2 : "transparent",
    border: "none",
    color: active ? C.gold : C.boneDim,
    padding: "8px 0",
    fontSize: 12,
    fontFamily: MONO,
    cursor: "pointer",
    textAlign: "center",
    fontWeight: active ? "bold" : "normal",
    borderBottom: active ? `2px solid ${C.gold}` : "none",
  };
}
