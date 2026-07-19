export interface Skill {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
}

export interface ClassTemplate {
  key: string;
  name: string;
  title: string;
  icon: string;
  accent: string;
  base: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    focusMax: number;
  };
  attackVerb: string;
  backstory: string;
  skills: Skill[];
  epilogue: string;
}

export interface Enemy {
  name: string;
  hp: number;
  curHp?: number;
  atk: number;
  def: number;
  xp: number;
  gold: number;
  icon: string;
  variant?: string;
  color?: string;
  boss?: boolean;
}

export interface Item {
  name: string;
  type: "potion" | "scroll" | "focus" | "atk" | "def" | "maxhp" | "gold" | "key" | "torch" | "relic";
  amt?: number;
  icon: string;
  heal?: number;
  dmg?: number;
}

export interface Npc {
  kind: "soldier" | "ghost" | "prisoner" | "bard" | "merchant" | "priest" | "scholar" | "lore";
  name: string;
  dialogueStep: number;
  hasRewarded?: boolean;
}

export interface SecretRoom {
  grid: string[][];
  item: Item;
  entryPos: [number, number];
  itemPos: [number, number];
}

export interface MapData {
  grid: string[][];
  enemyData: Record<string, Enemy>;
  itemData: Record<string, Item>;
  chestData: Record<string, { opened: boolean }>;
  npcData: Record<string, Npc>;
  startPos: [number, number];
  secretRoom: SecretRoom;
  savedPos: [number, number] | null;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  gold: number;
  focus: number;
  focusMax: number;
}
