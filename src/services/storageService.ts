import { UserStats } from '../types';

const STORAGE_KEY = 'cyber_brain_games_stats_v1';

const defaultStats: UserStats = {
  reaction: {
    bestTime: null,
    lastTime: null,
    history: [],
    averageLast5: null,
    totalAttempts: 0,
  },
  memory: {
    highScore: 0,
    highestLevel: 1,
    gamesPlayed: 0,
    perfectRounds: 0,
  },
  focus: {
    highScore: 0,
    bestAccuracy: 0,
    gamesPlayed: 0,
  },
  chimp: {
    highestLevel: 1,
    maxNumbers: 4,
    gamesPlayed: 0,
    flawlessRuns: 0,
    bestTimeMs: null,
  },
  math: {
    highScore: 0,
    maxStreak: 0,
    totalSolved: 0,
    gamesPlayed: 0,
    bestAccuracy: 0,
  },
  lastActive: new Date().toISOString(),
};

export const loadUserStats = (): UserStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      reaction: { ...defaultStats.reaction, ...parsed.reaction },
      memory: { ...defaultStats.memory, ...parsed.memory },
      focus: { ...defaultStats.focus, ...parsed.focus },
      chimp: { ...defaultStats.chimp, ...parsed.chimp },
      math: { ...defaultStats.math, ...parsed.math },
      lastActive: parsed.lastActive || new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to load stats from localStorage:', e);
    return defaultStats;
  }
};

export const saveUserStats = (stats: UserStats): void => {
  try {
    const updated = {
      ...stats,
      lastActive: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save stats to localStorage:', e);
  }
};

export const clearAllLocalData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('cyber_sound_muted');
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
};
