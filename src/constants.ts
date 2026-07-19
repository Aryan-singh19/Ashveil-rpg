import { ClassTemplate, Enemy, Item } from "./types";

export const C = {
  bg: "#050403",
  panel: "#14100d",
  panel2: "#1e1814",
  border: "#3a2e26",
  borderBright: "#614d3f",
  bone: "#ebe5d8",
  boneDim: "#a19385",
  gold: "#d4a728",
  blood: "#802222",
  bloodBright: "#d93b3b",
  moss: "#567a4d",
  slate: "#443e38",
  stoneWall: "#241e1a",
  stoneFloor: "#1a1512",
  arcane: "#5679db",
  mana: "#2b4da3",
};

export const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
export const MONO = 'ui-monospace, "SF Mono", "Cascadia Code", "Courier New", monospace';
export const GRID_SIZE = 9;
export const VIEW_RADIUS = 2; // Enhanced vision radius for better immersion!

export const CLASSES: Record<string, ClassTemplate> = {
  knight: {
    key: "knight",
    name: "Knight",
    title: "The Sworn Blade",
    icon: "🤺",
    accent: C.gold,
    base: { hp: 42, maxHp: 42, atk: 8, def: 5, focusMax: 4 },
    attackVerb: "cleave into",
    backstory: "You served Ashveil's Gate Watch for nine long, bitter winters. When the beacons went black, your companions fled. You swore an oath on your cracked blade, and you intend to keep it.",
    skills: [
      { id: "bash", name: "Shield Bash", cost: 2, icon: "🛡️", desc: "Heavy blow; deals damage and halves the enemy's next strike by stagger." },
      { id: "wind", name: "Second Wind", cost: 3, icon: "✨", desc: "Invoke inner strength to recover 30% of your maximum health." },
    ],
    epilogue: "You sheathe your battered sword in the throne room's final silence. The crown lay in ashes. A knight's oath was to protect the kingdom—tonight, in the dark, that was finally enough.",
  },
  mage: {
    key: "mage",
    name: "Mage",
    title: "The Ashbound Scholar",
    icon: "🧙",
    accent: C.arcane,
    base: { hp: 28, maxHp: 28, atk: 7, def: 2, focusMax: 5 },
    attackVerb: "scorch",
    backstory: "You read the dying of the beacon in your astrolabe from the southern spires. While the Archmages called it a political squabble, you recognized the necrotic ashfall for what it truly was.",
    skills: [
      { id: "fireball", name: "Arcane Fireball", cost: 3, icon: "🔥", desc: "Violent explosion of flame that bypasses 50% of the target's defense armor." },
      { id: "ward", name: "Frost Ward", cost: 2, icon: "❄️", desc: "Draw a protective sigil that absorbs 70% of the next hit and heals minor wounds." },
    ],
    epilogue: "Your journals on Ashveil's tragic eclipse are complete. You close the iron clasps. Some histories are so heavy they are only meant to be written once.",
  },
  rogue: {
    key: "rogue",
    name: "Rogue",
    title: "The Silent Blade",
    icon: "🗡️",
    accent: C.moss,
    base: { hp: 32, maxHp: 32, atk: 9, def: 3, focusMax: 4 },
    attackVerb: "carve",
    backstory: "You were never stationed at Ashveil—you were deep in its treasuries pocketing gold when the gates locked down. Finding yourself trapped, you decided the only way out was straight through the top.",
    skills: [
      { id: "backstab", name: "Backstab", cost: 2, icon: "🔪", desc: "Devastating surprise attack. Deals double damage if used as your first action in battle." },
      { id: "smoke", name: "Smoke Bomb", cost: 1, icon: "💨", desc: "Vanish in a soot cloud, dealing a small parting blow and fleeing immediately." },
    ],
    epilogue: "You pick up the crown's lone remaining ruby, flipping it into the dark. Some legends are worth far more than the physical gold.",
  },
};

export const FLOOR_META: Record<number, { name: string; intro: string }> = {
  1: {
    name: "The Gatehouse",
    intro: "Rot and cold ash have completely overrun Ashveil's outer wall. Feral vermin and broken garrison guards patrol what brave soldiers once held.",
  },
  2: {
    name: "The Great Hall",
    intro: "Tattered velvet banners hang in heavy soot. Fanatical cultists who took the halls chant the Hollow King's name like a dark, desperate prayer.",
  },
  3: {
    name: "The Throne Room",
    intro: "Eerie pale light pours from the shattered glass above the throne. King Aldric awaits you, clutching his crown in the frozen gloom.",
  },
};

export const LORE_FRAGMENTS: Record<number, string[]> = {
  1: [
    "A fractured stone plaque reads: 'Here stood the Gate Watch, standing faithful on the night the beacon faded.'",
    "A water-logged watch journal: 'The King hasn't left his private chambers in weeks. He keeps talking of a key to bring the Queen back.'",
    "A discarded letter: 'They say the local priests are performing strange rites. We hear screaming from the basements at midnight.'",
  ],
  2: [
    "A scorched royal tapestry shows a proud king crowned in gold, but the face has been savagely slashed away.",
    "A scholar's ledger: 'The fever was absolute. The physicians wept. But King Aldric refused the grave. He made a bargain with the Veil, and the castle shifted.'",
    "Carved in a dining table: 'We followed him into the dark because we loved him. Now we follow him because we have forgotten how to die.'",
  ],
  3: [
    "Carved fresh into the throne's footstool: 'HE PROMISED WE WOULD FEEL NO MORE PAIN.'",
    "A small child's parchment drawing: A king, a queen, and a bright castle. The queen is circled in red ink, over and over, until the paper tore.",
    "A faded decree: 'Let the bells ring no more. Let the sun set forever. For if she cannot see the light, then neither shall my kingdom.'",
  ],
};

export const TRAILER_SLIDES = [
  { key: "title", title: "ASHVEIL", sub: "A grand fortress sitting at the rim of the world's eye." },
  { key: "dark", title: "THE BEACONS DIED", sub: "Three days of quiet. No trade carts. No message hawks. Only black ash falling." },
  { key: "king", title: "THE HOLLOW COLD SEAT", sub: "A grieving King bargains with the deep veil, remaking his courts into a tomb." },
  { key: "heroes", title: "A SOLITARY WANDERER ARRIVES", sub: "With steel, staff, or shadow, you step into the Gatehouse to break the lock." },
  { key: "call", title: "WILL YOU FREE ASHVEIL?", sub: "Or will your ashes join the floorboards?" },
];

export const ENEMY_TABLE: Record<number, Enemy[]> = {
  1: [
    { name: "Rat Wretch", hp: 14, atk: 4, def: 1, xp: 10, gold: 3, icon: "🐀", variant: "small", color: "#8a7a63" },
    { name: "Bone Scout", hp: 18, atk: 5, def: 2, xp: 14, gold: 5, icon: "💀", variant: "humanoid", color: "#d8d2c2" },
    { name: "Crypt Moth Swarm", hp: 12, atk: 6, def: 0, xp: 12, gold: 4, icon: "🦋", variant: "small", color: "#6a5a8a" },
    { name: "Rusted Watchman", hp: 22, atk: 5, def: 3, xp: 16, gold: 6, icon: "🥾", variant: "humanoid", color: "#7c8a6b" },
  ],
  2: [
    { name: "Sorrow Ghast", hp: 26, atk: 7, def: 3, xp: 22, gold: 9, icon: "👻", variant: "ghost", color: "#7fa88f" },
    { name: "Ash Cultist", hp: 30, atk: 8, def: 4, xp: 26, gold: 11, icon: "🗡️", variant: "humanoid", color: "#5a5654" },
    { name: "Grave Gargoyle", hp: 38, atk: 6, def: 7, xp: 30, gold: 13, icon: "🗿", variant: "stone", color: "#8a8580" },
    { name: "Cinder Priest", hp: 48, atk: 10, def: 5, xp: 40, gold: 20, icon: "🕯️", variant: "humanoid", color: "#6b2d2d" },
  ],
  3: [
    { name: "The Hollow King", hp: 110, atk: 13, def: 7, xp: 300, gold: 150, icon: "👑", boss: true, variant: "boss", color: "#4a1f1f" },
  ],
};

export const STAT_ITEMS: Item[] = [
  { name: "Grindstone", type: "atk", amt: 2, icon: "🔪" },
  { name: "Sentry Shield", type: "def", amt: 2, icon: "🛡️" },
  { name: "Dragon Edge", type: "atk", amt: 4, icon: "⚔️" },
  { name: "Cinder Chestplate", type: "def", amt: 4, icon: "🪖" },
  { name: "Veil Talisman", type: "maxhp", amt: 10, icon: "🧿" },
  { name: "Bloodstone Relic", type: "atk", amt: 5, icon: "🩸" },
  { name: "Dusk Pauldron", type: "def", amt: 3, icon: "肩" },
];

export const CONSUMABLES: Item[] = [
  { name: "Health Elixir", type: "potion", heal: 18, icon: "🧪" },
  { name: "Cinder Scroll", type: "scroll", dmg: 25, icon: "📜" },
  { name: "Starlight Ether", type: "focus", amt: 2, icon: "🔷" },
  { name: "Royal Nectar", type: "potion", heal: 35, icon: "🏺" },
  { name: "Void Powder", type: "scroll", dmg: 40, icon: "🌫️" },
];

export const RELICS: Item[] = [
  { name: "Ring of Thorns", type: "relic", icon: "💍" },
  { name: "Void Heart", type: "relic", icon: "🖤" },
  { name: "Gilded Hourglass", type: "relic", icon: "⏳" },
  { name: "Eternal Ember", type: "relic", icon: "🕯️" },
];

export const FLOOR_AFFIXES = [
  { name: "Ashen Chill", desc: "Drains torch 25% faster. Suffer 20% reduced defense.", icon: "❄️" },
  { name: "Grave Winds", desc: "Whistling winds grant you +5 extra damage on Crit strikes.", icon: "💨" },
  { name: "Void Echoes", desc: "Abilities deal +5 bonus damage, but consume 1 additional Focus.", icon: "🌀" },
  { name: "Blood Feast", desc: "Unstable energies cause all bleed damage ticks to deal +1 damage.", icon: "🩸" },
];

export const GOLD_ITEM: Item = { name: "Gold Pouch", type: "gold", amt: 12, icon: "💰" };
export const KEY_ITEM: Item = { name: "Brass Key", type: "key", icon: "🗝️" };
