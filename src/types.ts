export type ActiveGame = 'reaction' | 'memory' | 'focus' | 'chimp' | 'math';

export type ActiveModal = 'privacy' | 'disclaimer' | 'cookies' | 'founder' | null;

export interface ReactionStats {
  bestTime: number | null;
  lastTime: number | null;
  history: number[];
  averageLast5: number | null;
  totalAttempts: number;
}

export interface MemoryStats {
  highScore: number;
  highestLevel: number;
  gamesPlayed: number;
  perfectRounds: number;
}

export interface FocusStats {
  highScore: number;
  bestAccuracy: number;
  gamesPlayed: number;
}

export interface ChimpStats {
  highestLevel: number;
  maxNumbers: number;
  gamesPlayed: number;
  flawlessRuns: number;
  bestTimeMs: number | null;
}

export interface MathStats {
  highScore: number;
  maxStreak: number;
  totalSolved: number;
  gamesPlayed: number;
  bestAccuracy: number;
}

export interface UserStats {
  reaction: ReactionStats;
  memory: MemoryStats;
  focus: FocusStats;
  chimp: ChimpStats;
  math: MathStats;
  lastActive: string;
}
