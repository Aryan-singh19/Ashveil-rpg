import React, { useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";
import { Sword, Shield, Heart, Package, FlaskConical, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Flame, Key, Coins, Volume2, VolumeX, Sparkles } from "lucide-react";

// ---------- Theme ----------
const C = {
  bg: "#0b0908", panel: "#181310", panel2: "#221b16", border: "#3a2f26",
  bone: "#e8e1d0", boneDim: "#a89b85", blood: "#8c2f2f", bloodBright: "#c14848",
  gold: "#c9a227", moss: "#5b7553", slate: "#4d443b", stoneWall: "#2b2521",
  stoneFloor: "#241e19", arcane: "#6a7fd6",
};
const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const MONO = 'ui-monospace, "SF Mono", "Cascadia Code", "Courier New", monospace';
const GRID_SIZE = 9;
const VIEW_RADIUS = 1;

// ---------- Classes ----------
const CLASSES = {
  knight: {
    key: "knight", name: "Knight", title: "The Sworn Blade", icon: "🤺", accent: C.gold,
    base: { hp: 40, maxHp: 40, atk: 7, def: 4, focusMax: 3 },
    attackVerb: "cleave into",
    backstory: "You served Ashveil's Gate Watch for nine winters. When the beacon died, you were the only one who volunteered to find out why.",
    skills: [
      { id: "bash", name: "Shield Bash", cost: 2, icon: "🛡️", desc: "Heavy blow; halves the next enemy hit." },
      { id: "wind", name: "Second Wind", cost: 3, icon: "✨", desc: "Recover 25% of max health." },
    ],
    epilogue: "You sheathe your sword in the throne room's silence. A knight's oath was to protect the castle — tonight, for once, that was enough.",
  },
  mage: {
    key: "mage", name: "Mage", title: "The Ashbound Scholar", icon: "🧙", accent: C.arcane,
    base: { hp: 26, maxHp: 26, atk: 6, def: 1, focusMax: 4 },
    attackVerb: "scorch",
    backstory: "You read the beacon's dying light in your tower and knew, before anyone else, what kind of dark had taken root in Ashveil.",
    skills: [
      { id: "fireball", name: "Fireball", cost: 3, icon: "🔥", desc: "Burst of flame; mostly ignores armor." },
      { id: "ward", name: "Frost Ward", cost: 2, icon: "❄️", desc: "Shield absorbing 70% of the next hit, plus minor healing." },
    ],
    epilogue: "Your notes on the Hollow King fill three journals now. You close the last one. Some knowledge is only worth having once.",
  },
  rogue: {
    key: "rogue", name: "Rogue", title: "The Silent Blade", icon: "🗡️", accent: C.moss,
    base: { hp: 30, maxHp: 30, atk: 8, def: 2, focusMax: 3 },
    attackVerb: "carve",
    backstory: "You were never garrisoned at Ashveil — you were robbing it, the night the gate went quiet. Seemed only fair to finish the job.",
    skills: [
      { id: "backstab", name: "Backstab", cost: 2, icon: "🔪", desc: "Devastating if it's your first strike this fight." },
      { id: "smoke", name: "Smoke Bomb", cost: 1, icon: "💨", desc: "Guaranteed escape, with a parting cut." },
    ],
    epilogue: "You take nothing from the throne room but the story. For once in your life, that's worth more than the gold.",
  },
};

const FLOOR_META = {
  1: { name: "The Gatehouse", intro: "Rot has crept through Ashveil's outer wall. Rats and broken men now guard what soldiers once held." },
  2: { name: "The Great Hall", intro: "Banners hang in ash. The cultists who took the Hall speak the Hollow King's name like a prayer." },
  3: { name: "The Throne Room", intro: "Cold light spills from the throne itself. He has been waiting a long time for someone to arrive." },
};
const LORE_FRAGMENTS = {
  1: [
    "A cracked plaque: 'Here fell the Gate Watch, on the night the crown went dark.'",
    "A soldier's diary, water-warped: 'King Aldric hasn't left the Throne Room in a month. He says he's close to saving her.'",
  ],
  2: [
    "A scorched tapestry once showed a king crowned in gold — now his face is scratched away.",
    "A cultist's ledger, mid-sentence: 'The Queen's fever broke on the wrong side of the veil. His Majesty would not accept that. His Majesty still won't.'",
  ],
  3: [
    "Carved fresh into stone, still damp: 'HE PROMISED US IT WOULD NOT HURT.'",
    "A child's drawing pinned above the throne: a king, a queen, and a castle with a sun over it. Someone has circled the queen in red, over and over.",
  ],
};

const TRAILER_SLIDES = [
  { key: "title", title: "ASHVEIL", sub: "A castle at the edge of the kingdom." },
  { key: "dark", title: "THE BEACON WENT DARK", sub: "Three days of silence from the garrison. No riders. No word." },
  { key: "king", title: "SOMETHING WEARS THE CROWN NOW", sub: "The Hollow King remakes the halls in his image, room by room." },
  { key: "heroes", title: "ONE LAST ARRIVAL ANSWERS THE CALL", sub: "The Gatehouse. The Great Hall. The Throne Room." },
  { key: "call", title: "WILL YOU RECLAIM ASHVEIL?", sub: "" },
];

const ENEMY_TABLE = {
  1: [
    { name: "Rat Wretch", hp: 14, atk: 4, def: 1, xp: 10, gold: 3, icon: "🐀", variant: "small", color: "#8a7a63" },
    { name: "Bone Scout", hp: 18, atk: 5, def: 2, xp: 14, gold: 5, icon: "💀", variant: "humanoid", color: "#d8d2c2" },
    { name: "Crypt Moth Swarm", hp: 12, atk: 6, def: 0, xp: 12, gold: 4, icon: "🦋", variant: "small", color: "#6a5a8a" },
    { name: "Rusted Watchman", hp: 22, atk: 5, def: 3, xp: 16, gold: 6, icon: "🥾", variant: "humanoid", color: "#7c8a6b" },
  ],
  2: [
    { name: "Bog Ghast", hp: 26, atk: 7, def: 3, xp: 22, gold: 9, icon: "👻", variant: "ghost", color: "#7fa88f" },
    { name: "Iron Cultist", hp: 30, atk: 8, def: 4, xp: 26, gold: 11, icon: "🗡️", variant: "humanoid", color: "#5a5654" },
    { name: "Stone Gargoyle", hp: 38, atk: 6, def: 7, xp: 30, gold: 13, icon: "🗿", variant: "stone", color: "#8a8580" },
    { name: "Cultist Lord", hp: 48, atk: 10, def: 5, xp: 40, gold: 20, icon: "🕯️", variant: "humanoid", color: "#6b2d2d" },
  ],
  3: [{ name: "The Hollow King", hp: 95, atk: 12, def: 6, xp: 220, gold: 90, icon: "👑", boss: true, variant: "boss", color: "#4a1f1f" }],
};

const STAT_ITEMS = [
  { name: "Whetstone", type: "atk", amt: 2, icon: "🔪" },
  { name: "Old Shield", type: "def", amt: 2, icon: "🛡️" },
  { name: "Masterwork Edge", type: "atk", amt: 4, icon: "⚔️" },
  { name: "Tower Plate", type: "def", amt: 4, icon: "🪖" },
  { name: "Blessed Charm", type: "maxhp", amt: 8, icon: "🧿" },
];
const CONSUMABLES = [
  { name: "Health Draught", type: "potion", heal: 16, icon: "🧪" },
  { name: "Scroll of Flame", type: "scroll", dmg: 22, icon: "📜" },
  { name: "Ether Vial", type: "focus", amt: 2, icon: "🔷" },
];
const GOLD_ITEM = { name: "Gold Pile", type: "gold", amt: 10, icon: "💰" };

function rand(n) { return Math.floor(Math.random() * n); }
function randRange(lo, hi) { return lo + rand(hi - lo + 1); }
function key(x, y) { return `${x},${y}`; }
function pick(arr) { return arr[rand(arr.length)]; }

function shade(hex, pct) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + Math.round(255 * pct);
  let g = ((num >> 8) & 0xff) + Math.round(255 * pct);
  let b = (num & 0xff) + Math.round(255 * pct);
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- Character / monster sprites ----------
function KnightSprite({ uid = "k", accent = "#c9a227" }) {
  return (
    <svg viewBox="0 0 60 80" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4e9ee" /><stop offset="100%" stopColor="#7d8792" />
        </linearGradient>
        <linearGradient id={`${uid}-metalD`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aab2ba" /><stop offset="100%" stopColor="#565e66" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="75" rx="15" ry="4" fill="#000" opacity="0.35" />
      <rect x="20" y="52" width="8" height="20" rx="3" fill={`url(#${uid}-metalD)`} />
      <rect x="32" y="52" width="8" height="20" rx="3" fill={`url(#${uid}-metalD)`} />
      <rect x="16" y="28" width="28" height="28" rx="7" fill={`url(#${uid}-metal)`} />
      <rect x="16" y="38" width="28" height="4" fill={accent} opacity="0.8" />
      <circle cx="12" cy="34" r="7" fill={`url(#${uid}-metalD)`} />
      <circle cx="48" cy="34" r="7" fill={`url(#${uid}-metalD)`} />
      <circle cx="30" cy="16" r="12" fill={`url(#${uid}-metal)`} />
      <rect x="22" y="14" width="16" height="4" fill="#2a2622" opacity="0.8" />
      <polygon points="30,2 26,10 34,10" fill={accent} />
      <ellipse cx="9" cy="42" rx="6" ry="9" fill={accent} opacity="0.85" />
      <line x1="49" y1="22" x2="57" y2="52" stroke={`url(#${uid}-metal)`} strokeWidth="4" strokeLinecap="round" />
      <circle cx="49" cy="22" r="3" fill={accent} />
    </svg>
  );
}

function MageSprite({ uid = "m", accent = "#6a7fd6" }) {
  return (
    <svg viewBox="0 0 60 80" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-robe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(accent, 0.15)} /><stop offset="100%" stopColor={shade(accent, -0.35)} />
        </linearGradient>
        <radialGradient id={`${uid}-orb`}><stop offset="0%" stopColor="#fff" /><stop offset="60%" stopColor={accent} /><stop offset="100%" stopColor={accent} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="30" cy="75" rx="15" ry="4" fill="#000" opacity="0.35" />
      <path d="M18 74 L14 40 Q30 24 46 40 L42 74 Z" fill={`url(#${uid}-robe)`} />
      <path d="M16 26 Q30 8 44 26 Q30 20 16 26 Z" fill={shade(accent, -0.2)} />
      <circle cx="24" cy="30" r="2.4" fill={accent} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      <circle cx="34" cy="30" r="2.4" fill={accent} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      <line x1="46" y1="30" x2="52" y2="70" stroke="#5a4a3a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="26" r="6" fill={`url(#${uid}-orb)`} />
      <circle cx="12" cy="20" r="2" fill={accent} opacity="0.8" />
      <circle cx="50" cy="14" r="1.6" fill={accent} opacity="0.7" />
    </svg>
  );
}

function RogueSprite({ uid = "r", accent = "#5b7553" }) {
  return (
    <svg viewBox="0 0 60 80" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-cloak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(accent, -0.05)} /><stop offset="100%" stopColor={shade(accent, -0.45)} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="75" rx="14" ry="4" fill="#000" opacity="0.35" />
      <path d="M20 74 L16 42 Q30 30 44 42 L40 74 Z" fill={`url(#${uid}-cloak)`} />
      <path d="M18 30 Q30 12 42 30 Q30 24 18 30 Z" fill={shade(accent, -0.3)} />
      <circle cx="25" cy="34" r="2" fill={accent} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      <circle cx="33" cy="34" r="2" fill={accent} style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
      <line x1="14" y1="46" x2="28" y2="58" stroke="#c8c8c8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="46" x2="32" y2="58" stroke="#c8c8c8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function HollowKingSprite({ uid = "hk", anim }) {
  return (
    <svg viewBox="0 0 90 110" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-robe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2020" /><stop offset="100%" stopColor="#120909" />
        </linearGradient>
        <radialGradient id={`${uid}-aura`}><stop offset="0%" stopColor="#c14848" stopOpacity="0.55" /><stop offset="100%" stopColor="#c14848" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="45" cy="55" r="42" fill={`url(#${uid}-aura)`} style={{ animation: "flicker 2.4s ease-in-out infinite" }} />
      <ellipse cx="45" cy="103" rx="22" ry="5" fill="#000" opacity="0.4" />
      <path d="M22 100 L14 48 Q45 26 76 48 L68 100 Q45 108 22 100 Z" fill={`url(#${uid}-robe)`} />
      <circle cx="45" cy="34" r="14" fill="#241414" />
      <circle cx="39" cy="34" r="2.6" fill="#d9534f" style={{ filter: "drop-shadow(0 0 5px #d9534f)" }} />
      <circle cx="51" cy="34" r="2.6" fill="#d9534f" style={{ filter: "drop-shadow(0 0 5px #d9534f)" }} />
      <polygon points="30,22 33,8 39,18 45,4 51,18 57,8 60,22" fill="#c9a227" />
    </svg>
  );
}

function MonsterSprite({ enemy, uid = "mon" }) {
  const c = enemy.color || "#7a7264";
  const variant = enemy.variant || "humanoid";
  if (variant === "small") {
    return (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <defs><radialGradient id={`${uid}-b`}><stop offset="0%" stopColor={shade(c, 0.2)} /><stop offset="100%" stopColor={shade(c, -0.25)} /></radialGradient></defs>
        <ellipse cx="25" cy="46" rx="12" ry="3" fill="#000" opacity="0.3" />
        <polygon points="10,20 2,8 16,16" fill={shade(c, -0.1)} />
        <polygon points="40,20 48,8 34,16" fill={shade(c, -0.1)} />
        <ellipse cx="25" cy="30" rx="16" ry="13" fill={`url(#${uid}-b)`} />
        <circle cx="19" cy="27" r="2.2" fill="#e8532c" style={{ filter: "drop-shadow(0 0 3px #e8532c)" }} />
        <circle cx="31" cy="27" r="2.2" fill="#e8532c" style={{ filter: "drop-shadow(0 0 3px #e8532c)" }} />
      </svg>
    );
  }
  if (variant === "ghost") {
    return (
      <svg viewBox="0 0 50 60" width="100%" height="100%">
        <defs><linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={shade(c, 0.2)} stopOpacity="0.9" /><stop offset="100%" stopColor={shade(c, -0.2)} stopOpacity="0.55" /></linearGradient></defs>
        <path d="M12 50 Q10 20 25 10 Q40 20 38 50 Q34 44 30 50 Q26 44 22 50 Q18 44 12 50 Z" fill={`url(#${uid}-g)`} />
        <circle cx="19" cy="26" r="2.4" fill="#dff6ea" style={{ filter: "drop-shadow(0 0 4px #9fe8c4)" }} />
        <circle cx="31" cy="26" r="2.4" fill="#dff6ea" style={{ filter: "drop-shadow(0 0 4px #9fe8c4)" }} />
      </svg>
    );
  }
  if (variant === "stone") {
    return (
      <svg viewBox="0 0 54 60" width="100%" height="100%">
        <defs><linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={shade(c, 0.15)} /><stop offset="100%" stopColor={shade(c, -0.3)} /></linearGradient></defs>
        <ellipse cx="27" cy="56" rx="14" ry="3.5" fill="#000" opacity="0.3" />
        <polygon points="10,50 8,24 20,14 34,14 46,24 44,50" fill={`url(#${uid}-s)`} />
        <polygon points="16,16 10,4 22,12" fill={shade(c, -0.2)} />
        <polygon points="38,16 44,4 32,12" fill={shade(c, -0.2)} />
        <circle cx="21" cy="28" r="2.4" fill="#e8c94a" style={{ filter: "drop-shadow(0 0 3px #e8c94a)" }} />
        <circle cx="33" cy="28" r="2.4" fill="#e8c94a" style={{ filter: "drop-shadow(0 0 3px #e8c94a)" }} />
      </svg>
    );
  }
  // humanoid default
  return (
    <svg viewBox="0 0 50 62" width="100%" height="100%">
      <defs><linearGradient id={`${uid}-h`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={shade(c, 0.18)} /><stop offset="100%" stopColor={shade(c, -0.3)} /></linearGradient></defs>
      <ellipse cx="25" cy="58" rx="13" ry="3.5" fill="#000" opacity="0.3" />
      <path d="M13 56 L10 30 Q25 18 40 30 L37 56 Z" fill={`url(#${uid}-h)`} />
      <circle cx="25" cy="18" r="10" fill={`url(#${uid}-h)`} />
      <circle cx="21" cy="18" r="2" fill="#e8532c" style={{ filter: "drop-shadow(0 0 3px #e8532c)" }} />
      <circle cx="29" cy="18" r="2" fill="#e8532c" style={{ filter: "drop-shadow(0 0 3px #e8532c)" }} />
      <line x1="10" y1="34" x2="2" y2="48" stroke={shade(c, -0.2)} strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="34" x2="48" y2="48" stroke={shade(c, -0.2)} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ClassSprite({ classKey, accent }) {
  if (classKey === "knight") return <KnightSprite accent={accent} />;
  if (classKey === "mage") return <MageSprite accent={accent} />;
  return <RogueSprite accent={accent} />;
}

function EnemySprite({ enemy }) {
  if (enemy.boss) return <HollowKingSprite />;
  return <MonsterSprite enemy={enemy} uid={enemy.name.replace(/\s/g, "")} />;
}

// ---------- Tile / item art ----------
function ItemIcon({ item }) {
  const t = item.type;
  if (t === "potion") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M10 3h4v3l3 5v8a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8l3-5z" fill="#d9d2c2" opacity="0.9" />
      <path d="M8 14h8v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#c14848" />
      <rect x="9" y="2" width="6" height="2" rx="0.6" fill="#8a7a63" />
    </svg>
  );
  if (t === "scroll") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="4" y="8" width="16" height="8" rx="2" fill="#d9cba6" />
      <circle cx="4" cy="12" r="2.4" fill="#9a8a5f" /><circle cx="20" cy="12" r="2.4" fill="#9a8a5f" />
      <line x1="7" y1="10.5" x2="17" y2="10.5" stroke="#8c2f2f" strokeWidth="1" />
      <line x1="7" y1="13" x2="14" y2="13" stroke="#8c2f2f" strokeWidth="1" />
    </svg>
  );
  if (t === "key") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="7" cy="12" r="4.2" fill="none" stroke="#c9a227" strokeWidth="2.4" />
      <rect x="11" y="10.8" width="10" height="2.4" fill="#c9a227" />
      <rect x="17" y="13" width="2.2" height="3" fill="#c9a227" /><rect x="20" y="13" width="2.2" height="3.6" fill="#c9a227" />
    </svg>
  );
  if (t === "gold") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <ellipse cx="9" cy="16" rx="6" ry="3" fill="#8a6a1f" /><ellipse cx="9" cy="14" rx="6" ry="3" fill="#e0b933" />
      <ellipse cx="15" cy="13" rx="6" ry="3" fill="#8a6a1f" /><ellipse cx="15" cy="11" rx="6" ry="3" fill="#f0cf55" />
    </svg>
  );
  if (t === "atk") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <line x1="4" y1="20" x2="18" y2="6" stroke="#cfd6dd" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="20" x2="20" y2="14" stroke="#8a6a3f" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
  if (t === "def") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 2 L21 6 V12 C21 18 17 21 12 23 C7 21 3 18 3 12 V6 Z" fill="#6d7580" />
      <path d="M12 4.5 L18.5 7.3 V12 C18.5 16.4 15.7 18.7 12 20.4 C8.3 18.7 5.5 16.4 5.5 12 V7.3 Z" fill="#9aa4ae" />
    </svg>
  );
  if (t === "maxhp") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <polygon points="12,2 20,9 16,22 8,22 4,9" fill="#7fa8d6" opacity="0.9" />
      <polygon points="12,5 17,9.5 14,19 10,19 7,9.5" fill="#bfe0ff" />
    </svg>
  );
  if (t === "focus") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 3 L17 9 V17 L12 21 L7 17 V9 Z" fill="#3d5aa8" opacity="0.85" />
      <path d="M12 6 L15 10 V15.5 L12 18 L9 15.5 V10 Z" fill="#8fb0f5" />
    </svg>
  );
  return null;
}

function ChestIcon({ locked }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="3" y="11" width="18" height="9" rx="1.5" fill="#6b4a2f" />
      <rect x="3" y="7" width="18" height="6" rx="1.5" fill="#8a6238" />
      <rect x="10.5" y="10" width="3" height="4" rx="0.6" fill={locked === false ? "#5b7553" : "#c9a227"} />
      <rect x="3" y="12.5" width="18" height="1.6" fill="#3a2618" />
    </svg>
  );
}
function StairsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <polygon points="4,20 4,15 9,15 9,10 14,10 14,5 20,5 20,20" fill="#8a8072" opacity="0.85" />
      <polygon points="4,20 20,20 20,17 4,17" fill="#3a322b" />
    </svg>
  );
}
function PortalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ animation: "spinSlow 3s linear infinite" }}>
      <defs><radialGradient id="portalG"><stop offset="0%" stopColor="#fff" /><stop offset="45%" stopColor="#6a7fd6" /><stop offset="100%" stopColor="#241a3a" /></radialGradient></defs>
      <circle cx="12" cy="12" r="10" fill="url(#portalG)" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#bcaef0" strokeWidth="1" opacity="0.6" />
      <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
    </svg>
  );
}
function BrazierIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M8 16 Q6 20 12 21 Q18 20 16 16 Z" fill="#3a322b" />
      <path d="M12 3 Q8 9 11 12 Q9 13 10 16 Q12 18 14 16 Q15 13 13 12 Q16 9 12 3 Z" fill="#e8862c" style={{ animation: "flicker 1.2s ease-in-out infinite" }} />
    </svg>
  );
}
function LoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="5" y="4" width="14" height="17" rx="1" fill="#5a5248" />
      <rect x="7" y="7" width="10" height="1.6" fill="#2b2521" /><rect x="7" y="10.5" width="10" height="1.6" fill="#2b2521" /><rect x="7" y="14" width="6" height="1.6" fill="#2b2521" />
    </svg>
  );
}
function NpcIcon({ kind }) {
  const colors = { soldier: "#7c8a6b", ghost: "#cfe8d8", prisoner: "#9a8a7a", bard: "#c9a227", merchant: "#8a6238" };
  const c = colors[kind] || "#a89b85";
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M8 21 L7 13 Q12 8 17 13 L16 21 Z" fill={c} />
      <circle cx="12" cy="7" r="4.2" fill={shade(c, 0.15)} />
      {kind === "prisoner" && <line x1="9" y1="15" x2="15" y2="18" stroke="#333" strokeWidth="1.4" />}
      {kind === "bard" && <ellipse cx="17" cy="16" rx="3" ry="4" fill="#5a3a1f" transform="rotate(20 17 16)" />}
      {kind === "merchant" && <path d="M6 8 Q12 2 18 8 L16 10 Q12 6 8 10 Z" fill="#3a2618" />}
    </svg>
  );
}

// ---------- Map generation ----------
function generateFloor(floor) {
  const size = GRID_SIZE;
  const grid = Array.from({ length: size }, () => Array(size).fill("wall"));
  let cx = Math.floor(size / 2), cy = Math.floor(size / 2);
  grid[cy][cx] = "floor";
  for (let i = 0; i < 150; i++) {
    const dir = rand(4);
    if (dir === 0) cx = Math.min(size - 2, cx + 1);
    else if (dir === 1) cx = Math.max(1, cx - 1);
    else if (dir === 2) cy = Math.min(size - 2, cy + 1);
    else cy = Math.max(1, cy - 1);
    grid[cy][cx] = "floor";
  }
  const floorCells = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid[y][x] === "floor") floorCells.push([x, y]);
  const startPos = [Math.floor(size / 2), Math.floor(size / 2)];
  const away = (c) => Math.abs(c[0] - startPos[0]) + Math.abs(c[1] - startPos[1]);
  const sorted = [...floorCells].sort((a, b) => away(b) - away(a));
  const stairsPos = sorted[0];
  grid[stairsPos[1]][stairsPos[0]] = "stairs";
  const usable = sorted.slice(1).filter((c) => away(c) > 2);
  const takeSpot = () => {
    for (let t = 0; t < 40; t++) { const c = usable[rand(usable.length)]; if (grid[c[1]][c[0]] === "floor") return c; }
    return null;
  };

  const enemyData = {};
  const pool = ENEMY_TABLE[floor];
  const enemyCount = floor === 3 ? 1 : 4 + floor;
  for (let i = 0; i < enemyCount; i++) {
    const c = takeSpot(); if (!c) continue;
    const e = { ...pick(pool) }; e.curHp = e.hp;
    grid[c[1]][c[0]] = "enemy"; enemyData[key(c[0], c[1])] = e;
  }
  if (floor === 3) {
    grid[stairsPos[1]][stairsPos[0]] = "enemy";
    const boss = { ...pool[0] }; boss.curHp = boss.hp;
    enemyData[key(stairsPos[0], stairsPos[1])] = boss;
  }

  const itemData = {};
  for (let i = 0; i < 3; i++) {
    const c = takeSpot(); if (!c) continue;
    const roll = rand(10);
    const item = roll < 3 ? pick(CONSUMABLES) : roll < 5 ? pick(STAT_ITEMS) : roll < 7 ? GOLD_ITEM : { name: "Rusted Key", type: "key", icon: "🗝️" };
    grid[c[1]][c[0]] = "item"; itemData[key(c[0], c[1])] = item;
  }

  const chestData = {};
  const c0 = takeSpot();
  if (c0) { grid[c0[1]][c0[0]] = "chest"; chestData[key(c0[0], c0[1])] = { opened: false }; }

  const npcData = {};
  const cl = takeSpot();
  if (cl) { grid[cl[1]][cl[0]] = "lore"; npcData[key(cl[0], cl[1])] = { kind: "lore" }; }
  if (floor === 1) {
    const c2 = takeSpot(); if (c2) { grid[c2[1]][c2[0]] = "npc"; npcData[key(c2[0], c2[1])] = { kind: "soldier" }; }
    const c3 = takeSpot(); if (c3) { grid[c3[1]][c3[0]] = "npc"; npcData[key(c3[0], c3[1])] = { kind: "ghost" }; }
  }
  if (floor === 2) {
    const c2 = takeSpot(); if (c2) { grid[c2[1]][c2[0]] = "npc"; npcData[key(c2[0], c2[1])] = { kind: "prisoner" }; }
    const c3 = takeSpot(); if (c3) { grid[c3[1]][c3[0]] = "npc"; npcData[key(c3[0], c3[1])] = { kind: "bard" }; }
  }
  const cm = takeSpot();
  if (cm) { grid[cm[1]][cm[0]] = "merchant"; npcData[key(cm[0], cm[1])] = { kind: "merchant" }; }

  for (let i = 0; i < 2; i++) { const c = takeSpot(); if (c && grid[c[1]][c[0]] === "floor") grid[c[1]][c[0]] = "brazier"; }

  const cp = takeSpot();
  if (cp) grid[cp[1]][cp[0]] = "portal";

  // secret pocket room reachable via portal
  const secretItem = rand(2) === 0 ? { ...pick(STAT_ITEMS), amt: pick(STAT_ITEMS).amt } : { ...GOLD_ITEM, amt: 30 };
  const secretGrid = Array.from({ length: 5 }, () => Array(5).fill("floor"));
  for (let x = 0; x < 5; x++) { secretGrid[0][x] = "wall"; secretGrid[4][x] = "wall"; }
  for (let y = 0; y < 5; y++) { secretGrid[y][0] = "wall"; secretGrid[y][4] = "wall"; }
  secretGrid[2][3] = "secret-item";
  secretGrid[2][1] = "portal-back";
  const secretRoom = { grid: secretGrid, item: secretItem, entryPos: [1, 2], itemPos: [3, 2] };

  return { grid, enemyData, itemData, chestData, npcData, startPos, secretRoom, savedPos: null };
}

function classStats(cls) { return { ...CLASSES[cls].base, level: 1, xp: 0, xpToNext: 22, gold: 0, focus: 1 }; }

// ---------- Sound engine ----------
function useSoundEngine() {
  const ref = useRef({ ready: false, muted: false, synths: null, notesRef: { current: ["C3", "Eb3", "G3"] }, loop: null });

  const ensureInit = useCallback(async () => {
    if (ref.current.ready) return;
    await Tone.start();
    const pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 1.2, decay: 0.6, sustain: 0.5, release: 2.5 } }).toDestination();
    pad.volume.value = -20;
    const bass = new Tone.MonoSynth({ oscillator: { type: "triangle" }, envelope: { attack: 0.4, decay: 0.3, sustain: 0.4, release: 1.5 } }).toDestination();
    bass.volume.value = -16;
    const sfx = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 } }).toDestination();
    sfx.volume.value = -8;
    const noise = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).toDestination();
    noise.volume.value = -14;
    const pluck = new Tone.PluckSynth().toDestination();
    pluck.volume.value = -10;
    Tone.Transport.bpm.value = 68;
    const loop = new Tone.Loop((time) => {
      pad.triggerAttackRelease(ref.current.notesRef.current, "2n", time);
      bass.triggerAttackRelease(ref.current.notesRef.current[0], "1n", time);
    }, "2n").start(0);
    Tone.Transport.start();
    ref.current.synths = { pad, bass, sfx, noise, pluck };
    ref.current.loop = loop;
    ref.current.ready = true;
  }, []);

  const setMuted = useCallback((m) => {
    ref.current.muted = m;
    Tone.Destination.mute = m;
  }, []);

  const setMood = useCallback((notes, bpm) => {
    ref.current.notesRef.current = notes;
    if (ref.current.ready) Tone.Transport.bpm.rampTo(bpm, 1.5);
  }, []);

  const sfx = {
    step: () => { if (ref.current.ready) ref.current.synths.noise.triggerAttackRelease("32n"); },
    attack: () => { if (ref.current.ready) ref.current.synths.sfx.triggerAttackRelease("C5", "16n"); },
    hit: () => { if (ref.current.ready) ref.current.synths.sfx.triggerAttackRelease("A2", "8n"); },
    heal: () => { if (ref.current.ready) { const s = ref.current.synths.pluck; ["C4", "E4", "G4"].forEach((n, i) => setTimeout(() => s.triggerAttackRelease(n, "8n"), i * 90)); } },
    pickup: () => { if (ref.current.ready) ref.current.synths.pluck.triggerAttackRelease("E5", "16n"); },
    levelup: () => { if (ref.current.ready) { const s = ref.current.synths.pluck; ["C4", "E4", "G4", "C5"].forEach((n, i) => setTimeout(() => s.triggerAttackRelease(n, "8n"), i * 100)); } },
    portal: () => { if (ref.current.ready) { const s = ref.current.synths.sfx; ["G5", "E5", "C5", "G4"].forEach((n, i) => setTimeout(() => s.triggerAttackRelease(n, "16n"), i * 60)); } },
    victory: () => { if (ref.current.ready) { const s = ref.current.synths.pad; ["C4", "E4", "G4", "C5"].forEach((n, i) => setTimeout(() => s.triggerAttackRelease(n, "4n"), i * 180)); } },
    gameover: () => { if (ref.current.ready) { const s = ref.current.synths.pad; ["C3", "B2", "Ab2"].forEach((n, i) => setTimeout(() => s.triggerAttackRelease(n, "2n"), i * 300)); } },
  };

  return { ensureInit, setMuted, setMood, sfx };
}

// ---------- Component ----------
export default function AshveilRPG() {
  const sound = useSoundEngine();
  const [muted, setMutedState] = useState(false);
  const [stage, setStage] = useState("title"); // title | trailer | select | intro | game
  const [trailerIndex, setTrailerIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);

  const [floor, setFloor] = useState(1);
  const [mapData, setMapData] = useState(null);
  const [pos, setPos] = useState([0, 0]);
  const [visited, setVisited] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [keyCount, setKeyCount] = useState(0);
  const [log, setLog] = useState([]);
  const [combat, setCombat] = useState(null);
  const [screen, setScreen] = useState("explore");
  const [actionMenu, setActionMenu] = useState("main"); // main | skills | items
  const [playerAnim, setPlayerAnim] = useState("idle");
  const [enemyAnim, setEnemyAnim] = useState("idle");
  const [shake, setShake] = useState(false);
  const [playerShield, setPlayerShield] = useState(0);
  const [firstStrike, setFirstStrike] = useState(true);
  const [inSecret, setInSecret] = useState(false);
  const [transition, setTransition] = useState(null);
  const logRef = useRef(null);

  const cls = selectedClass ? CLASSES[selectedClass] : null;
  const pushLog = useCallback((msg) => setLog((l) => [...l.slice(-40), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const fireTransition = useCallback((label, icon, duration = 750) => {
    setTransition({ label, icon });
    setTimeout(() => setTransition(null), duration);
  }, []);

  const reveal = useCallback((px, py) => {
    setVisited((prev) => {
      const next = new Set(prev);
      for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++)
        for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
          const nx = px + dx, ny = py + dy;
          if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) next.add(key(nx, ny));
        }
      return next;
    });
  }, []);

  const doShake = useCallback(() => { setShake(true); setTimeout(() => setShake(false), 260); }, []);

  const MOODS = {
    1: [["C3", "Eb3", "G3"], 68],
    2: [["D3", "F3", "Ab3"], 72],
    3: [["C3", "Db3", "Gb3"], 60],
  };

  const startFloor = useCallback((n) => {
    const data = generateFloor(n);
    setMapData(data); setPos(data.startPos); setVisited(new Set()); setFloor(n);
    setTimeout(() => reveal(data.startPos[0], data.startPos[1]), 0);
    pushLog(`— ${FLOOR_META[n].name} —`);
    pushLog(FLOOR_META[n].intro);
    sound.setMood(MOODS[n][0], MOODS[n][1]);
  }, [reveal, pushLog, sound]);

  const beginFromTitle = useCallback(async () => {
    await sound.ensureInit();
    sound.setMood(["C3", "Eb3", "Bb2"], 56);
    setTrailerIndex(0);
    setStage("trailer");
  }, [sound]);

  const skipTrailer = useCallback(() => setStage("select"), []);

  useEffect(() => {
    if (stage !== "trailer") return;
    if (trailerIndex >= TRAILER_SLIDES.length - 1) return;
    const t = setTimeout(() => setTrailerIndex((i) => i + 1), 2900);
    return () => clearTimeout(t);
  }, [stage, trailerIndex]);

  const chooseClass = useCallback(async (k) => {
    setSelectedClass(k);
    await sound.ensureInit();
    sound.setMood(MOODS[1][0], MOODS[1][1]);
    setStage("intro");
  }, [sound]);

  const beginGame = useCallback(() => {
    setStats(classStats(selectedClass));
    setStage("game");
    const data = generateFloor(1);
    setMapData(data); setPos(data.startPos); setVisited(new Set()); setFloor(1);
    setTimeout(() => reveal(data.startPos[0], data.startPos[1]), 0);
    setLog([`— ${FLOOR_META[1].name} —`, FLOOR_META[1].intro]);
  }, [selectedClass, reveal]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => { sound.setMuted(!m); return !m; });
  }, [sound]);

  const tryLevelUp = useCallback((s) => {
    let { hp, maxHp, atk, def, level, xp, xpToNext } = s;
    let leveled = false;
    while (xp >= xpToNext) {
      xp -= xpToNext; level += 1; maxHp += 6; atk += 2; def += 1; hp = maxHp; leveled = true;
      xpToNext = Math.floor(xpToNext * 1.4);
      pushLog(`⬆ Level up! You are now level ${level}.`);
    }
    if (leveled) sound.sfx.levelup();
    return { ...s, hp, maxHp, atk, def, level, xp, xpToNext };
  }, [pushLog, sound]);

  const grantItem = useCallback((item) => {
    sound.sfx.pickup();
    if (item.type === "potion" || item.type === "scroll" || item.type === "focus") {
      setInventory((inv) => [...inv, item]); pushLog(`Found a ${item.name}.`);
    } else if (item.type === "atk") { setStats((s) => ({ ...s, atk: s.atk + item.amt })); pushLog(`Found ${item.name}. ATK +${item.amt}.`); }
    else if (item.type === "def") { setStats((s) => ({ ...s, def: s.def + item.amt })); pushLog(`Found ${item.name}. DEF +${item.amt}.`); }
    else if (item.type === "maxhp") { setStats((s) => ({ ...s, maxHp: s.maxHp + item.amt, hp: s.hp + item.amt })); pushLog(`Found ${item.name}. Max HP +${item.amt}.`); }
    else if (item.type === "gold") { setStats((s) => ({ ...s, gold: s.gold + item.amt })); pushLog(`Found ${item.name}. +${item.amt} gold.`); }
    else if (item.type === "key") { setKeyCount((k) => k + 1); pushLog(`Found a ${item.name}.`); }
  }, [pushLog, sound]);

  // ---------- Exploration movement ----------
  const movePlayer = useCallback((dx, dy) => {
    if (screen !== "explore" || inSecret) return;
    const [x, y] = pos; const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return;
    const tile = mapData.grid[ny][nx];
    if (tile === "wall") return;
    const k = key(nx, ny);

    if (tile === "enemy") {
      const enemy = mapData.enemyData[k];
      if (enemy && enemy.curHp > 0) {
        setCombat({ enemyKey: k, enemy: { ...enemy } });
        setScreen("combat"); setEnemyAnim("idle"); setActionMenu("main"); setFirstStrike(true);
        if (enemy.boss) {
          doShake();
          pushLog(`The ${enemy.name} turns to face you!`);
          pushLog("The Hollow King: 'You wear the same steel they all wore. It didn't help them either.'");
          pushLog("The crown's crest matches the seal on the old castle gate. This was never an invader's throne — it was always his.");
        } else {
          pushLog(`The ${enemy.name} turns to face you!`);
        }
        return;
      }
    }

    sound.sfx.step();
    setPlayerAnim("walk"); setTimeout(() => setPlayerAnim("idle"), 220);
    setPos([nx, ny]); reveal(nx, ny);

    if (tile === "item") {
      const item = mapData.itemData[k];
      if (item) {
        grantItem(item);
        setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; const ni = { ...md.itemData }; delete ni[k]; return { ...md, grid: g, itemData: ni }; });
      }
    } else if (tile === "chest") {
      const chest = mapData.chestData[k];
      if (chest && !chest.opened) {
        if (keyCount > 0) {
          setKeyCount((kc) => kc - 1);
          const reward = rand(3) === 0 ? GOLD_ITEM : rand(2) === 0 ? pick(CONSUMABLES) : pick(STAT_ITEMS);
          pushLog("The chest creaks open.");
          grantItem(reward.amt ? { ...reward, amt: reward.amt * 2 } : reward);
          setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; const nc = { ...md.chestData }; delete nc[k]; return { ...md, grid: g, chestData: nc }; });
        } else pushLog("A locked chest. You need a key.");
      }
    } else if (tile === "lore") {
      pushLog(pick(LORE_FRAGMENTS[floor]));
      setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; return { ...md, grid: g }; });
    } else if (tile === "npc") {
      const npc = mapData.npcData[k];
      if (npc?.kind === "soldier") {
        pushLog("A wounded soldier: 'The gate crumbled fast. Take this — I've no more use for it.'");
        grantItem(pick(STAT_ITEMS));
        setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; return { ...md, grid: g }; });
      } else if (npc?.kind === "ghost") {
        pushLog("A child's voice, faint: 'It's warmer if you don't stop moving.' You feel steadier. (+8 max HP)");
        setStats((s) => ({ ...s, maxHp: s.maxHp + 8, hp: s.hp + 8 }));
        setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; return { ...md, grid: g }; });
      } else if (npc?.kind === "prisoner") {
        pushLog("You break the prisoner's chains. 'The King isn't a man anymore,' she warns, pressing gold into your hand before fleeing.");
        setStats((s) => ({ ...s, gold: s.gold + 25 }));
        setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; return { ...md, grid: g }; });
      } else if (npc?.kind === "bard") {
        pushLog("A blind bard hums an old marching song. Your grip feels surer. (+1 ATK, permanent)");
        setStats((s) => ({ ...s, atk: s.atk + 1 }));
        setMapData((md) => { const g = md.grid.map((r) => r.slice()); g[ny][nx] = "floor"; return { ...md, grid: g }; });
      }
    } else if (tile === "merchant") {
      setScreen("shop"); pushLog("A hooded merchant: 'Gold spends the same in a dying castle as anywhere else.'");
    } else if (tile === "portal") {
      fireTransition("Through the portal...", "🌀", 700);
      sound.sfx.portal();
      setTimeout(() => {
        setMapData((md) => ({ ...md, savedPos: [nx, ny] }));
        setInSecret(true);
        setPos(mapData.secretRoom.entryPos);
      }, 380);
    } else if (tile === "stairs") {
      if (floor < 3) {
        fireTransition(`Descending to ${FLOOR_META[floor + 1].name}...`, "🕯️", 800);
        sound.sfx.portal();
        setTimeout(() => { pushLog(`You descend toward ${FLOOR_META[floor + 1].name}.`); startFloor(floor + 1); }, 500);
      }
    }
  }, [screen, inSecret, pos, mapData, reveal, grantItem, floor, startFloor, pushLog, keyCount, doShake, sound, fireTransition]);

  const moveInSecret = useCallback((dx, dy) => {
    if (!inSecret || !mapData) return;
    const [x, y] = pos; const nx = x + dx, ny = y + dy;
    const sg = mapData.secretRoom.grid;
    if (nx < 0 || ny < 0 || nx >= sg[0].length || ny >= sg.length) return;
    const tile = sg[ny][nx];
    if (tile === "wall") return;
    sound.sfx.step();
    setPlayerAnim("walk"); setTimeout(() => setPlayerAnim("idle"), 220);
    setPos([nx, ny]);
    if (tile === "secret-item") {
      grantItem(mapData.secretRoom.item);
      setMapData((md) => {
        const g2 = md.secretRoom.grid.map((r) => r.slice()); g2[ny][nx] = "floor";
        return { ...md, secretRoom: { ...md.secretRoom, grid: g2 } };
      });
    } else if (tile === "portal-back") {
      fireTransition("Back through the portal...", "🌀", 600);
      sound.sfx.portal();
      setTimeout(() => { setInSecret(false); setPos(mapData.savedPos || mapData.startPos); }, 350);
    }
  }, [inSecret, mapData, pos, grantItem, sound, fireTransition]);

  useEffect(() => {
    const handler = (e) => {
      if (stage !== "game" || screen !== "explore") return;
      const fn = inSecret ? moveInSecret : movePlayer;
      if (e.key === "ArrowUp") fn(0, -1);
      else if (e.key === "ArrowDown") fn(0, 1);
      else if (e.key === "ArrowLeft") fn(-1, 0);
      else if (e.key === "ArrowRight") fn(1, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [movePlayer, moveInSecret, screen, inSecret, stage]);

  // ---------- Combat ----------
  const resolveEnemyDeath = useCallback((enemyRef) => {
    sound.sfx.hit();
    pushLog(`The ${enemyRef.name} falls. (+${enemyRef.xp} xp, +${enemyRef.gold} gold)`);
    setMapData((md) => {
      const [ex, ey] = combat.enemyKey.split(",").map(Number);
      const g = md.grid.map((r) => r.slice());
      g[ey][ex] = enemyRef.boss ? "stairs" : "floor";
      const ne = { ...md.enemyData }; delete ne[combat.enemyKey];
      return { ...md, grid: g, enemyData: ne };
    });
    setStats((s) => tryLevelUp({ ...s, xp: s.xp + enemyRef.xp, gold: s.gold + enemyRef.gold }));
    setTimeout(() => {
      setCombat(null); setScreen(enemyRef.boss ? "victory" : "explore");
      if (enemyRef.boss) { pushLog("The crown of the Hollow King shatters into ash. Ashveil breathes again."); sound.sfx.victory(); }
    }, enemyRef.boss ? 900 : 350);
  }, [combat, pushLog, tryLevelUp, sound]);

  const enemyTurn = useCallback((enemyState) => {
    setTimeout(() => {
      setStats((s) => {
        let dmg = Math.max(1, enemyState.atk - s.def + randRange(-2, 2));
        setPlayerShield((sh) => {
          if (sh > 0) { dmg = Math.max(0, Math.floor(dmg * (1 - sh))); return 0; }
          return sh;
        });
        const newHp = Math.max(0, s.hp - dmg);
        pushLog(`The ${enemyState.name} hits you for ${dmg}.`);
        sound.sfx.hit();
        setPlayerAnim("hurt"); setTimeout(() => setPlayerAnim("idle"), 300);
        if (newHp <= 0) { setScreen("gameover"); sound.sfx.gameover(); }
        return { ...s, hp: newHp, focus: Math.min(s.focusMax, s.focus + 1) };
      });
    }, 380);
  }, [pushLog, sound]);

  const playerAttack = useCallback(() => {
    if (!combat) return;
    setFirstStrike(false);
    sound.sfx.attack();
    setPlayerAnim("attack"); setTimeout(() => setPlayerAnim("idle"), 260);
    const dmg = Math.max(1, stats.atk - combat.enemy.def + randRange(-2, 2));
    const newHp = Math.max(0, combat.enemy.curHp - dmg);
    pushLog(`You ${cls.attackVerb} the ${combat.enemy.name} for ${dmg}.`);
    setEnemyAnim("hurt"); setTimeout(() => setEnemyAnim("idle"), 300);
    if (newHp <= 0) { setEnemyAnim("dead"); resolveEnemyDeath(combat.enemy); return; }
    setCombat((c) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
    enemyTurn({ ...combat.enemy, curHp: newHp });
  }, [combat, stats, cls, pushLog, enemyTurn, resolveEnemyDeath, sound]);

  const useSkill = useCallback((skillId) => {
    if (!combat || !stats) return;
    if (stats.focus < (cls.skills.find((s) => s.id === skillId)?.cost || 99)) { pushLog("Not enough focus."); return; }
    const skill = cls.skills.find((s) => s.id === skillId);
    setStats((s) => ({ ...s, focus: s.focus - skill.cost }));
    setActionMenu("main");

    if (skillId === "bash") {
      sound.sfx.attack(); setPlayerAnim("attack"); setTimeout(() => setPlayerAnim("idle"), 260);
      const dmg = Math.max(1, Math.floor(stats.atk * 1.4 - combat.enemy.def * 0.5));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`Shield Bash! You slam the ${combat.enemy.name} for ${dmg} and stagger its guard.`);
      setPlayerShield(0.5); setFirstStrike(false);
      setEnemyAnim("hurt"); setTimeout(() => setEnemyAnim("idle"), 300);
      if (newHp <= 0) { setEnemyAnim("dead"); resolveEnemyDeath(combat.enemy); return; }
      setCombat((c) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "wind") {
      const heal = Math.floor(stats.maxHp * 0.25);
      sound.sfx.heal();
      pushLog(`Second Wind. You recover ${heal} HP.`);
      setStats((s) => ({ ...s, hp: Math.min(s.maxHp, s.hp + heal) }));
      setFirstStrike(false);
      enemyTurn(combat.enemy);
    } else if (skillId === "fireball") {
      sound.sfx.attack(); setPlayerAnim("attack"); setTimeout(() => setPlayerAnim("idle"), 260);
      const dmg = Math.max(1, Math.floor(stats.atk * 1.6 - combat.enemy.def * 0.2));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`Fireball! Flame engulfs the ${combat.enemy.name} for ${dmg}.`);
      setFirstStrike(false);
      setEnemyAnim("hurt"); setTimeout(() => setEnemyAnim("idle"), 300);
      if (newHp <= 0) { setEnemyAnim("dead"); resolveEnemyDeath(combat.enemy); return; }
      setCombat((c) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "ward") {
      sound.sfx.heal();
      pushLog("Frost Ward. A cold shield forms around you.");
      setPlayerShield(0.7); setFirstStrike(false);
      setStats((s) => ({ ...s, hp: Math.min(s.maxHp, s.hp + 5) }));
      enemyTurn(combat.enemy);
    } else if (skillId === "backstab") {
      sound.sfx.attack(); setPlayerAnim("attack"); setTimeout(() => setPlayerAnim("idle"), 260);
      const mult = firstStrike ? 2 : 1.3;
      const dmg = Math.max(1, Math.floor(stats.atk * mult - combat.enemy.def * 0.4));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(firstStrike ? `Backstab! A perfect opening — ${dmg} damage!` : `Backstab deals ${dmg} damage.`);
      setFirstStrike(false);
      setEnemyAnim("hurt"); setTimeout(() => setEnemyAnim("idle"), 300);
      if (newHp <= 0) { setEnemyAnim("dead"); resolveEnemyDeath(combat.enemy); return; }
      setCombat((c) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } }));
      enemyTurn({ ...combat.enemy, curHp: newHp });
    } else if (skillId === "smoke") {
      const dmg = Math.max(0, Math.floor(stats.atk * 0.5 - combat.enemy.def));
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      pushLog(`Smoke Bomb! A parting cut for ${dmg} — you vanish before it can respond.`);
      if (newHp <= 0) { resolveEnemyDeath(combat.enemy); return; }
      setCombat(null); setScreen("explore");
    }
  }, [combat, stats, cls, pushLog, enemyTurn, resolveEnemyDeath, firstStrike, sound]);

  const playerDefend = useCallback(() => {
    if (!combat) return;
    setFirstStrike(false);
    pushLog("You brace behind your guard.");
    setStats((s) => {
      let dmg = Math.max(0, Math.floor((combat.enemy.atk - s.def) / 2) + randRange(-1, 1));
      const newHp = Math.max(0, s.hp - dmg);
      if (dmg > 0) { pushLog(`The ${combat.enemy.name} hits your guard for ${dmg}.`); sound.sfx.hit(); setPlayerAnim("hurt"); setTimeout(() => setPlayerAnim("idle"), 300); }
      else pushLog("You take no damage.");
      if (newHp <= 0) { setScreen("gameover"); sound.sfx.gameover(); }
      return { ...s, hp: newHp, focus: Math.min(s.focusMax, s.focus + 1) };
    });
  }, [combat, pushLog, sound]);

  const playerFlee = useCallback(() => {
    setFirstStrike(false);
    if (rand(100) < 55) { pushLog("You slip away into the dark."); setCombat(null); setScreen("explore"); }
    else { pushLog("You fail to escape!"); enemyTurn(combat.enemy); }
  }, [combat, pushLog, enemyTurn]);

  const useConsumable = useCallback((idx, inFight) => {
    const item = inventory[idx]; if (!item) return;
    if (item.type === "potion") {
      sound.sfx.heal();
      setStats((s) => ({ ...s, hp: Math.min(s.maxHp, s.hp + item.heal) }));
      pushLog(`You drink the ${item.name}. +${item.heal} HP.`);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
      if (inFight && combat) { setFirstStrike(false); enemyTurn(combat.enemy); }
    } else if (item.type === "focus") {
      sound.sfx.heal();
      setStats((s) => ({ ...s, focus: Math.min(s.focusMax, s.focus + item.amt) }));
      pushLog(`You drink the ${item.name}. +${item.amt} focus.`);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main");
    } else if (item.type === "scroll") {
      if (!inFight || !combat) { pushLog("Save this scroll for battle."); return; }
      const dmg = item.dmg;
      sound.sfx.attack();
      pushLog(`The ${item.name} erupts! ${dmg} damage, armor ignored.`);
      setEnemyAnim("hurt"); setTimeout(() => setEnemyAnim("idle"), 300);
      const newHp = Math.max(0, combat.enemy.curHp - dmg);
      setInventory((inv) => inv.filter((_, i) => i !== idx));
      setActionMenu("main"); setFirstStrike(false);
      if (newHp <= 0) { setEnemyAnim("dead"); resolveEnemyDeath(combat.enemy); }
      else { setCombat((c) => ({ ...c, enemy: { ...c.enemy, curHp: newHp } })); enemyTurn({ ...combat.enemy, curHp: newHp }); }
    }
  }, [inventory, pushLog, combat, enemyTurn, resolveEnemyDeath, sound]);

  const buyItem = useCallback((offer) => {
    setStats((s) => {
      if (s.gold < offer.cost) { pushLog("Not enough gold."); return s; }
      pushLog(`You buy a ${offer.item.name}.`); sound.sfx.pickup();
      if (offer.item.type === "key") setKeyCount((k) => k + 1); else setInventory((inv) => [...inv, offer.item]);
      return { ...s, gold: s.gold - offer.cost };
    });
  }, [pushLog, sound]);

  const restart = useCallback(() => {
    setStage("select"); setSelectedClass(null); setStats(null); setInventory([]); setKeyCount(0);
    setLog([]); setCombat(null); setScreen("explore"); setInSecret(false); setPlayerShield(0);
  }, []);

  if (!cls && stage !== "select") { /* safety */ }

  const hpPct = stats ? Math.max(0, (stats.hp / stats.maxHp) * 100) : 0;
  const xpPct = stats ? Math.max(0, (stats.xp / stats.xpToNext) * 100) : 0;
  const enemyHpPct = combat ? Math.max(0, (combat.enemy.curHp / combat.enemy.hp) * 100) : 0;

  const tileVisual = (tile, k) => {
    if (tile === "stairs") return <StairsIcon />;
    if (tile === "enemy") { const e = mapData.enemyData[k]; return e ? <EnemySprite enemy={e} /> : null; }
    if (tile === "item") { const it = mapData.itemData[k]; return it ? <ItemIcon item={it} /> : null; }
    if (tile === "chest") return <ChestIcon />;
    if (tile === "lore") return <LoreIcon />;
    if (tile === "merchant") return <NpcIcon kind="merchant" />;
    if (tile === "portal") return <PortalIcon />;
    if (tile === "npc") return <NpcIcon kind={mapData.npcData[k]?.kind} />;
    if (tile === "brazier") return <BrazierIcon />;
    return null;
  };

  const shopOffers = [
    { item: CONSUMABLES[0], cost: 10 }, { item: CONSUMABLES[1], cost: 16 },
    { item: CONSUMABLES[2], cost: 14 }, { item: { name: "Rusted Key", type: "key", icon: "🗝️" }, cost: 12 },
  ];

  const MuteBtn = (
    <button onClick={toggleMute} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, color: C.boneDim, padding: 6, cursor: "pointer" }}>
      {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );

  return (
    <div style={{ background: C.bg, color: C.bone, minHeight: "100vh", fontFamily: MONO, display: "flex", justifyContent: "center", padding: "16px 10px", position: "relative", animation: shake ? "screenShake 0.26s" : "none" }}>
      <style>{`
        @keyframes screenShake{0%,100%{transform:translate(0,0);}20%{transform:translate(-4px,2px);}40%{transform:translate(4px,-2px);}60%{transform:translate(-3px,1px);}80%{transform:translate(3px,-1px);}}
        @keyframes floatIdle{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
        @keyframes flicker{0%,100%{opacity:1;}50%{opacity:0.55;}}
        @keyframes lungeRight{0%{transform:translateX(0) scale(1);}40%{transform:translateX(18px) scale(1.08);}100%{transform:translateX(0) scale(1);}}
        @keyframes hurtShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}50%{transform:translateX(6px);}75%{transform:translateX(-4px);}}
        @keyframes deathFade{0%{opacity:1;transform:scale(1) rotate(0deg);}100%{opacity:0;transform:scale(0.4) rotate(20deg) translateY(20px);}}
        @keyframes walkBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes hitFlash{0%{background:rgba(193,72,72,0.55);}100%{background:rgba(193,72,72,0);}}
        @keyframes overlayFade{0%{opacity:0;}15%{opacity:1;}85%{opacity:1;}100%{opacity:0;}}
        @keyframes spinSlow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
      `}</style>

      {transition && (
        <div style={{ position: "fixed", inset: 0, background: "#050403", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "overlayFade 0.75s ease" }}>
          <div style={{ fontSize: 42, animation: "spinSlow 1.2s linear infinite" }}>{transition.icon}</div>
          <div style={{ fontFamily: SERIF, color: C.gold, marginTop: 10, fontSize: 14, letterSpacing: "0.05em" }}>{transition.label}</div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {MuteBtn}
        {stage !== "title" && stage !== "trailer" && (
          <>
            <div style={{ fontFamily: SERIF, textAlign: "center", letterSpacing: "0.1em", fontSize: 25, color: C.gold, marginBottom: 2, textTransform: "uppercase" }}>Ashveil</div>
            <div style={{ textAlign: "center", color: C.boneDim, fontSize: 11, marginBottom: 14, letterSpacing: "0.08em" }}>
              {stage === "select" ? "CHOOSE YOUR CHARACTER" : stage === "intro" ? "A FALLEN CASTLE" : inSecret ? "SECRET CHAMBER" : `${FLOOR_META[floor].name.toUpperCase()} · FLOOR ${floor} OF 3`}
            </div>
          </>
        )}

        {stage === "title" && (
          <div style={{ minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: 46, marginBottom: 6, animation: "flicker 2.6s ease-in-out infinite" }}>🕯️</div>
            <div style={{ fontFamily: SERIF, fontSize: 38, color: C.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Ashveil</div>
            <div style={{ fontSize: 12, color: C.boneDim, marginBottom: 28, letterSpacing: "0.06em" }}>THE SIEGE OF A FALLEN CASTLE</div>
            <button onClick={beginFromTitle} style={btnStyle(C.blood)}>Tap to Begin</button>
          </div>
        )}

        {stage === "trailer" && (() => {
          const slide = TRAILER_SLIDES[trailerIndex];
          const isLast = trailerIndex === TRAILER_SLIDES.length - 1;
          return (
            <div style={{ minHeight: 420, position: "relative" }}>
              <button onClick={skipTrailer} style={{ position: "absolute", top: 0, right: 0, background: "transparent", border: `1px solid ${C.border}`, color: C.boneDim, fontSize: 10, padding: "5px 9px", borderRadius: 4, cursor: "pointer", fontFamily: MONO }}>Skip ▶</button>
              <div key={trailerIndex} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, textAlign: "center", animation: "fadeInUp 0.6s ease" }}>
                <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  {slide.key === "title" && <div style={{ fontSize: 54 }}>🏰</div>}
                  {slide.key === "dark" && <div style={{ width: 60, height: 72, opacity: 0.8 }}><BrazierIcon /></div>}
                  {slide.key === "king" && <div style={{ width: 90, height: 96 }}><HollowKingSprite /></div>}
                  {slide.key === "heroes" && (
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 40, height: 52 }}><ClassSprite classKey="knight" accent={CLASSES.knight.accent} /></div>
                      <div style={{ width: 40, height: 52 }}><ClassSprite classKey="mage" accent={CLASSES.mage.accent} /></div>
                      <div style={{ width: 40, height: 52 }}><ClassSprite classKey="rogue" accent={CLASSES.rogue.accent} /></div>
                    </div>
                  )}
                  {slide.key === "call" && <div style={{ fontSize: 50, animation: "flicker 2s ease-in-out infinite" }}>👑</div>}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 21, color: C.gold, letterSpacing: "0.05em", marginBottom: 10, padding: "0 10px" }}>{slide.title}</div>
                {slide.sub && <div style={{ fontSize: 12, color: C.boneDim, lineHeight: 1.6, padding: "0 18px", marginBottom: 20 }}>{slide.sub}</div>}
                {isLast && <button onClick={skipTrailer} style={btnStyle(C.blood)}>Choose Your Hero</button>}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
                {TRAILER_SLIDES.map((_, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === trailerIndex ? C.gold : C.border }} />
                ))}
              </div>
            </div>
          );
        })()}

        {stage === "select" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.values(CLASSES).map((c) => (
              <div key={c.key} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 40, height: 50 }}><ClassSprite classKey={c.key} accent={c.accent} /></div>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 16, color: c.accent }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: C.boneDim }}>{c.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 11.5, color: C.boneDim, lineHeight: 1.6, margin: "0 0 8px" }}>{c.backstory}</p>
                <div style={{ fontSize: 10.5, color: C.boneDim, marginBottom: 10 }}>
                  {c.skills.map((s) => `${s.icon} ${s.name}`).join("   ")}
                </div>
                <button onClick={() => chooseClass(c.key)} style={{ ...btnStyle(C.blood), width: "100%" }}>Play as {c.name}</button>
              </div>
            ))}
          </div>
        )}

        {stage === "intro" && (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 22 }}>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: C.gold, marginBottom: 12, textAlign: "center" }}>The Siege of Ashveil</div>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: C.boneDim, margin: "0 0 10px" }}>Three days ago, the beacon at Ashveil went dark. {cls.backstory}</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: C.boneDim, margin: "0 0 10px" }}>What answers the gate is not the garrison you remember. Something wearing a crown has taken root in the throne room, and the castle is changing to match it.</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: C.boneDim, margin: "0 0 18px" }}>Fight through the Gatehouse, the Great Hall, and the Throne Room. Whatever waits at the top put out that beacon on purpose.</p>
            <div style={{ textAlign: "center" }}><button onClick={beginGame} style={btnStyle(C.blood)}>Enter the Castle</button></div>
          </div>
        )}

        {stage === "game" && (screen === "gameover" || screen === "victory") && (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 26, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{screen === "victory" ? "👑" : "💀"}</div>
            <div style={{ fontFamily: SERIF, fontSize: 19, color: screen === "victory" ? C.gold : C.bloodBright, marginBottom: 14 }}>
              {screen === "victory" ? "The Hollow King Falls" : "You Have Perished"}
            </div>
            {screen === "victory" ? (
              <div style={{ textAlign: "left", fontSize: 12, color: C.boneDim, lineHeight: 1.7 }}>
                <p style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.1s" }}>The crown breaks to ash between your hands. For a moment the throne room is only a room — cold stone, dead torches, and you.</p>
                <p style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.5s" }}>Underneath it, just for a moment, you see a man's face — tired, grieving, not so different from any king who lost someone and refused to let the loss be real. Ashveil never fell to an invader. It fell to a widower's grief, and the castle changed shape to hold it.</p>
                <p style={{ animation: "fadeInUp 0.5s ease both", animationDelay: "0.9s" }}>{cls.epilogue}</p>
                <p style={{ marginTop: 14, color: C.gold, textAlign: "center", animation: "fadeInUp 0.5s ease both", animationDelay: "1.4s" }}>— THE END —</p>
                <p style={{ textAlign: "center", fontSize: 11, animation: "fadeInUp 0.5s ease both", animationDelay: "1.7s" }}>{cls.name} · Level {stats.level} · {stats.gold} gold gathered</p>
              </div>
            ) : (
              <div style={{ color: C.boneDim, fontSize: 12, marginBottom: 6 }}>You reached {FLOOR_META[floor].name} at level {stats.level}. Ashveil keeps its secrets a little longer.</div>
            )}
            <button onClick={restart} style={{ ...btnStyle(C.blood), marginTop: 18 }}>Play Again</button>
          </div>
        )}

        {stage === "game" && screen !== "gameover" && screen !== "victory" && stats && (
          <>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Heart size={12} color={C.bloodBright} /> {stats.hp}/{stats.maxHp}</span>
                <span>Lv {stats.level}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.boneDim }}><Key size={11} style={{ verticalAlign: -2 }} /> {keyCount}</span>
                  <span style={{ color: C.gold }}><Coins size={11} style={{ verticalAlign: -2 }} /> {stats.gold}</span>
                </span>
              </div>
              <Bar pct={hpPct} color={C.bloodBright} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 6, color: C.boneDim }}>
                <span>XP {stats.xp}/{stats.xpToNext}</span>
                <span style={{ display: "flex", gap: 10 }}>
                  <span><Sword size={11} style={{ verticalAlign: -2 }} /> {stats.atk}</span>
                  <span><Shield size={11} style={{ verticalAlign: -2 }} /> {stats.def}</span>
                </span>
              </div>
              <Bar pct={xpPct} color={C.gold} thin />
              <div style={{ display: "flex", gap: 3, marginTop: 6, alignItems: "center" }}>
                <Sparkles size={10} color={cls.accent} />
                {Array.from({ length: stats.focusMax }).map((_, i) => (
                  <span key={i} style={{ color: i < stats.focus ? cls.accent : C.border, fontSize: 12 }}>{i < stats.focus ? "◆" : "◇"}</span>
                ))}
              </div>
            </div>

            {screen === "explore" && (
              <>
                <div style={{ position: "relative", background: C.stoneWall, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8, aspectRatio: "1", marginBottom: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${inSecret ? 5 : GRID_SIZE}, 1fr)`, gap: 3, width: "100%", height: "100%" }}>
                    {(inSecret ? mapData.secretRoom.grid : mapData.grid).map((row, y) => row.map((tile, x) => {
                      const k = key(x, y);
                      const isVisited = inSecret ? true : visited.has(k);
                      const dist = Math.max(Math.abs(pos[0] - x), Math.abs(pos[1] - y));
                      const glow = inSecret ? 1 : dist <= VIEW_RADIUS ? 1 : isVisited ? 0.4 : 0;
                      const isDecorative = tile === "brazier";
                      const isWall = tile === "wall";
                      const variant = (x * 7 + y * 13) % 3;
                      const visual = inSecret
                        ? (tile === "secret-item" ? <ItemIcon item={mapData.secretRoom.item} /> : tile === "portal-back" ? <PortalIcon /> : null)
                        : tileVisual(tile, k);
                      return (
                        <div key={k} style={{
                          borderRadius: 3,
                          background: !isVisited ? "#070605"
                            : isWall
                              ? `linear-gradient(180deg, ${shade(C.stoneWall, 0.06 - variant * 0.02)}, ${shade(C.stoneWall, -0.08)})`
                              : `radial-gradient(circle at ${30 + variant * 15}% 30%, ${shade(C.stoneFloor, 0.05)}, ${C.stoneFloor})`,
                          backgroundImage: !isVisited ? "none" : isWall
                            ? "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 9px), repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 11px)"
                            : "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 6px)",
                          boxShadow: isVisited && !isWall ? "inset 0 0 4px rgba(0,0,0,0.5)" : "none",
                          opacity: isVisited ? 0.35 + glow * 0.65 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                        }}>
                          {isVisited && !isWall && visual ? (
                            <div style={{ width: "68%", height: "68%", animation: isDecorative ? "flicker 1.4s ease-in-out infinite" : (tile === "enemy" || tile === "npc" || tile === "merchant" || tile === "portal" || tile === "portal-back") ? "floatIdle 2.2s ease-in-out infinite" : "none" }}>
                              {visual}
                            </div>
                          ) : null}
                        </div>
                      );
                    }))}
                  </div>
                  <div style={{
                    position: "absolute",
                    left: `calc(8px + ${(pos[0] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${100 / (inSecret ? 5 : GRID_SIZE) / 2}%)`,
                    top: `calc(8px + ${(pos[1] / (inSecret ? 5 : GRID_SIZE)) * 100}% + ${100 / (inSecret ? 5 : GRID_SIZE) / 2}%)`,
                    transform: "translate(-50%,-50%)", transition: "left 0.16s ease, top 0.16s ease",
                    width: 30, height: 40, filter: `drop-shadow(0 0 5px ${cls.accent})`, pointerEvents: "none",
                  }}>
                    <div style={{ width: "100%", height: "100%", animation: playerAnim === "walk" ? "walkBob 0.22s ease" : "floatIdle 2s ease-in-out infinite" }}>
                      <ClassSprite classKey={cls.key} accent={cls.accent} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "48px 48px 48px", gridTemplateRows: "40px 40px 40px", gap: 4 }}>
                    <div />
                    <DpadBtn onClick={() => (inSecret ? moveInSecret : movePlayer)(0, -1)}><ChevronUp size={18} /></DpadBtn>
                    <div />
                    <DpadBtn onClick={() => (inSecret ? moveInSecret : movePlayer)(-1, 0)}><ChevronLeft size={18} /></DpadBtn>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: C.boneDim }}><Flame size={14} /></div>
                    <DpadBtn onClick={() => (inSecret ? moveInSecret : movePlayer)(1, 0)}><ChevronRight size={18} /></DpadBtn>
                    <div />
                    <DpadBtn onClick={() => (inSecret ? moveInSecret : movePlayer)(0, 1)}><ChevronDown size={18} /></DpadBtn>
                    <div />
                  </div>
                </div>
              </>
            )}

            {screen === "shop" && (
              <div style={{ background: C.panel, border: `1px solid ${C.gold}55`, borderRadius: 6, padding: 14, marginBottom: 12 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, color: C.gold, marginBottom: 10, textAlign: "center" }}>The Hooded Merchant</div>
                {shopOffers.map((o, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < shopOffers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 16, display: "inline-block" }}><ItemIcon item={o.item} /></span> {o.item.name}</span>
                    <button onClick={() => buyItem(o)} style={{ ...btnStyle(C.panel2), padding: "5px 10px", border: `1px solid ${C.border}` }}>{o.cost}g</button>
                  </div>
                ))}
                <button onClick={() => setScreen("explore")} style={{ ...btnStyle(C.slate), marginTop: 12, width: "100%" }}>Leave</button>
              </div>
            )}

            {screen === "combat" && combat && (
              <div style={{ background: C.panel, border: `1px solid ${C.blood}`, borderRadius: 6, padding: 14, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 10 }}>
                  <div style={{ width: 54, height: 68, animation: playerAnim === "attack" ? "lungeRight 0.26s ease" : playerAnim === "hurt" ? "hurtShake 0.3s ease" : "floatIdle 2s ease-in-out infinite" }}>
                    <ClassSprite classKey={cls.key} accent={cls.accent} />
                  </div>
                  <div style={{ width: combat.enemy.boss ? 84 : 60, height: combat.enemy.boss ? 92 : 68, position: "relative" }}>
                    <div style={{ width: "100%", height: "100%", animation: enemyAnim === "hurt" ? "hurtShake 0.3s ease" : enemyAnim === "dead" ? "deathFade 0.5s ease forwards" : "floatIdle 2.4s ease-in-out infinite" }}>
                      <EnemySprite enemy={combat.enemy} />
                    </div>
                    {enemyAnim === "hurt" && <div style={{ position: "absolute", inset: -6, borderRadius: 8, animation: "hitFlash 0.3s ease" }} />}
                  </div>
                </div>
                <div style={{ textAlign: "center", fontFamily: SERIF, fontSize: 15, marginBottom: 6 }}>{combat.enemy.name}</div>
                <Bar pct={enemyHpPct} color={C.moss} />
                <div style={{ textAlign: "center", fontSize: 10, color: C.boneDim, marginBottom: 12 }}>{combat.enemy.curHp}/{combat.enemy.hp} HP</div>

                {actionMenu === "main" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={playerAttack} style={btnStyle(C.blood)}><Sword size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Attack</button>
                    <button onClick={() => setActionMenu("skills")} style={btnStyle(cls.accent)}><Sparkles size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Skills</button>
                    <button onClick={playerDefend} style={btnStyle(C.slate)}><Shield size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Defend</button>
                    <button onClick={() => setActionMenu("items")} style={btnStyle(C.moss)}><FlaskConical size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Item</button>
                    <button onClick={playerFlee} style={{ ...btnStyle("#2a2622"), gridColumn: "1 / span 2" }}>Flee</button>
                  </div>
                )}
                {actionMenu === "skills" && (
                  <div>
                    {cls.skills.map((s) => (
                      <button key={s.id} disabled={stats.focus < s.cost} onClick={() => useSkill(s.id)} style={{ ...btnStyle(C.panel2), border: `1px solid ${C.border}`, width: "100%", textAlign: "left", marginBottom: 6, opacity: stats.focus < s.cost ? 0.4 : 1 }}>
                        {s.icon} {s.name} <span style={{ color: cls.accent }}>({s.cost}◆)</span>
                        <div style={{ fontSize: 10, color: C.boneDim, marginTop: 2 }}>{s.desc}</div>
                      </button>
                    ))}
                    <button onClick={() => setActionMenu("main")} style={{ ...btnStyle(C.slate), width: "100%" }}>Back</button>
                  </div>
                )}
                {actionMenu === "items" && (
                  <div>
                    {inventory.length === 0 ? <div style={{ fontSize: 11, color: C.boneDim, marginBottom: 8 }}>No usable items.</div> : inventory.map((it, i) => (
                      <button key={i} onClick={() => useConsumable(i, true)} style={{ ...btnStyle(C.panel2), border: `1px solid ${C.border}`, width: "100%", textAlign: "left", marginBottom: 6 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 15, height: 15, display: "inline-block" }}><ItemIcon item={it} /></span> {it.name} {it.heal ? `(+${it.heal} HP)` : it.dmg ? `(${it.dmg} dmg)` : it.amt ? `(+${it.amt} focus)` : ""}</span>
                      </button>
                    ))}
                    <button onClick={() => setActionMenu("main")} style={{ ...btnStyle(C.slate), width: "100%" }}>Back</button>
                  </div>
                )}
              </div>
            )}

            {screen === "explore" && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.boneDim, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Package size={11} /> SATCHEL</div>
                {inventory.length === 0 ? <div style={{ fontSize: 11, color: C.boneDim, opacity: 0.6 }}>Empty. Explore to find draughts and scrolls.</div> : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {inventory.map((it, i) => (
                      <button key={i} onClick={() => useConsumable(i, false)} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 4, color: C.bone, fontSize: 11, padding: "5px 8px", cursor: "pointer", fontFamily: MONO, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 14, display: "inline-block" }}><ItemIcon item={it} /></span> {it.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={logRef} style={{ background: "#0a0908", border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, height: 100, overflowY: "auto", fontSize: 11, color: C.boneDim, lineHeight: 1.6 }}>
              {log.map((line, i) => <div key={i} style={{ animation: "fadeInUp 0.25s ease" }}>{line}</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Bar({ pct, color, thin }) {
  return <div style={{ background: "#000", borderRadius: 3, height: thin ? 4 : 7, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.3s" }} /></div>;
}
function DpadBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ background: "#221b16", border: "1px solid #3a2f26", borderRadius: 6, color: "#e8e1d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{children}</button>;
}
function btnStyle(bg) {
  return { background: bg, border: "none", borderRadius: 5, color: "#e8e1d0", padding: "9px 10px", fontSize: 12, cursor: "pointer", fontFamily: MONO, letterSpacing: "0.02em" };
}
