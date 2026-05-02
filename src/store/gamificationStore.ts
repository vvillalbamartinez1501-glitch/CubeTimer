import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;          // Ionicons name
  color: string;         // medal color
  unlockedAt: string | null; // ISO date or null if locked
}

export interface PersonalGoals {
  [category: string]: number; // target time in ms, e.g. { '3x3': 15000 }
}

// ─── All possible achievements (locked by default) ───────────────────────────
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_solve',
    title: 'First Steps',
    description: 'Complete your very first solve.',
    icon: 'footsteps-outline',
    color: '#cd7f32', // bronze
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 total solves.',
    icon: 'shield-outline',
    color: '#c0c0c0', // silver
  },
  {
    id: 'sub20_3x3',
    title: 'Sub-20 Club',
    description: 'Solve 3x3 in under 20 seconds.',
    icon: 'flash-outline',
    color: '#ffd700', // gold
  },
  {
    id: 'sub15_3x3',
    title: 'Speed Demon',
    description: 'Solve 3x3 in under 15 seconds.',
    icon: 'rocket-outline',
    color: '#ff6b35', // orange-gold
  },
  {
    id: 'weekly_streak',
    title: 'Weekly Fire',
    description: 'Practice 7 days in a row.',
    icon: 'flame-outline',
    color: '#ff4757', // red-fire
  },
  {
    id: 'monthly_streak',
    title: 'Unstoppable',
    description: 'Practice 30 days in a row.',
    icon: 'bonfire-outline',
    color: '#ffa502', // amber
  },
  {
    id: 'sub10_3x3',
    title: 'Elite Cuber',
    description: 'Solve 3x3 in under 10 seconds.',
    icon: 'diamond-outline',
    color: '#7bed9f', // emerald
  },
  {
    id: 'consistent_50',
    title: 'Dedicated',
    description: 'Complete 50 solves in one category.',
    icon: 'medal-outline',
    color: '#c0c0c0', // silver
  },
];

// Helper: build the initial achievements array (all locked)
const buildInitialAchievements = (): Achievement[] =>
  ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlockedAt: null }));

// ─── State interface ──────────────────────────────────────────────────────────
interface GamificationState {
  streak: number;
  lastPracticeDate: string | null;   // ISO date string (date-only: YYYY-MM-DD)
  achievements: Achievement[];
  personalGoals: PersonalGoals;

  // Actions
  updateStreak: () => void;
  checkAchievements: (
    time: number,
    category: string,
    totalSolves: number,
    categoryTotalSolves: number,
  ) => Achievement[];  // returns newly unlocked achievements
  setGoal: (category: string, targetTimeMs: number) => void;
  resetGamification: () => void;
}

// ─── Helper: today as YYYY-MM-DD ─────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const diffDays = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastPracticeDate: null,
      achievements: buildInitialAchievements(),
      personalGoals: {},

      // ── updateStreak ─────────────────────────────────────────────────────
      updateStreak: () => {
        const { streak, lastPracticeDate } = get();
        const todayStr = today();

        if (!lastPracticeDate) {
          // Very first solve ever
          set({ streak: 1, lastPracticeDate: todayStr });
          return;
        }

        if (lastPracticeDate === todayStr) {
          // Already practiced today — no change needed
          return;
        }

        const diff = diffDays(lastPracticeDate, todayStr);

        if (diff === 1) {
          // Consecutive day
          set({ streak: streak + 1, lastPracticeDate: todayStr });
        } else {
          // Missed a day — reset
          set({ streak: 1, lastPracticeDate: todayStr });
        }
      },

      // ── checkAchievements ─────────────────────────────────────────────────
      checkAchievements: (time, category, totalSolves, categoryTotalSolves) => {
        const { achievements, streak } = get();
        const now = new Date().toISOString();
        const newlyUnlocked: Achievement[] = [];

        const updated = achievements.map(ach => {
          if (ach.unlockedAt) return ach; // already unlocked

          let shouldUnlock = false;

          switch (ach.id) {
            case 'first_solve':
              shouldUnlock = totalSolves >= 1;
              break;
            case 'centurion':
              shouldUnlock = totalSolves >= 100;
              break;
            case 'consistent_50':
              shouldUnlock = categoryTotalSolves >= 50;
              break;
            case 'sub20_3x3':
              shouldUnlock = category === '3x3' && time < 20_000;
              break;
            case 'sub15_3x3':
              shouldUnlock = category === '3x3' && time < 15_000;
              break;
            case 'sub10_3x3':
              shouldUnlock = category === '3x3' && time < 10_000;
              break;
            case 'weekly_streak':
              shouldUnlock = streak >= 7;
              break;
            case 'monthly_streak':
              shouldUnlock = streak >= 30;
              break;
          }

          if (shouldUnlock) {
            const unlocked = { ...ach, unlockedAt: now };
            newlyUnlocked.push(unlocked);
            return unlocked;
          }
          return ach;
        });

        if (newlyUnlocked.length > 0) {
          set({ achievements: updated });
        }

        return newlyUnlocked;
      },

      // ── setGoal ───────────────────────────────────────────────────────────
      setGoal: (category, targetTimeMs) => {
        set(state => ({
          personalGoals: { ...state.personalGoals, [category]: targetTimeMs },
        }));
      },

      // ── reset (for testing) ───────────────────────────────────────────────
      resetGamification: () => {
        set({
          streak: 0,
          lastPracticeDate: null,
          achievements: buildInitialAchievements(),
          personalGoals: {},
        });
      },
    }),
    {
      name: '@cube_gamification',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ─── Public selector: unlocked count ─────────────────────────────────────────
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS.length;
