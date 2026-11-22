export type BakeryItemId =
  | 'cookie'
  | 'muffin'
  | 'bread'
  | 'croissant'
  | 'cake'
  | 'cinnamon';

export type ScreenMode =
  | 'SPLASH'
  | 'LOBBY'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PINATA_WIN'
  | 'WORLD_COMPLETE_MODAL'
  | 'TREASURE_REVEAL';

export interface OrderRequirement {
  itemId: BakeryItemId;
  target: number;
  /** Optional mental-math prompt such as "10 + 4" or "20 - 3" shown on higher levels */
  expression?: string;
}

export interface OrderSpec {
  id: string;
  requirements: OrderRequirement[];
  hint: string;
  isTwist: boolean;
  customerIndex: number;
}

export interface LevelSpec {
  levelNumber: number; // 1 to 10
  title: string;
  orders: OrderSpec[];
  timerSeconds: number;
  baseRewardCoins: number;
  allowSubtractTools: boolean;
}

export interface WorldTheme {
  pageBg: string;
  panelBg: string;
  counterBg: string;
  awningA: string;
  awningB: string;
  accentHex: string;
  accentDarkHex: string;
  secondaryHex: string;
  glowHex: string;
  trayTop: string;
  trayBottom: string;
  textColor: string;
  subTextColor: string;
  isDarkTheme: boolean;
  patternClass: 'craft-dot-bg' | 'craft-star-bg';
}

export interface BakeryWorld {
  id: BakeryItemId;
  orderIndex: number; // 0..5
  name: string;
  pluralName: string;
  worldTitle: string;
  ovenName: string;
  difficultyLabel: string;
  description: string;
  /** World 0 uses 1 item; Worlds 1..5 use [thisWorld, previousWorld] */
  partnerItemId: BakeryItemId | null;
  theme: WorldTheme;
  levels: LevelSpec[];
}

export interface StackLayer {
  id: string;
  count: number;
  sourceTray: 2 | 5 | 10;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
  lastClaimedDate: string | null; // YYYY-MM-DD
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM
}

export interface SaveProgress {
  coins: number;
  /** Worlds that are unlocked and playable */
  unlockedWorlds: BakeryItemId[];
  /** Worlds that have been earned by completing previous world's 10 levels, awaiting treasure chest tap in Lobby */
  readyToUnlockWorlds: BakeryItemId[];
  /** Highest completed level per world (0..10) */
  completedLevels: Record<BakeryItemId, number>;
  /** Best stars per level key `${worldId}-${levelNum}` (1..3) */
  levelStars: Record<string, number>;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  mathHelperEnabled: boolean;
  cakesDecorated: number;
  streak: StreakData;
}
