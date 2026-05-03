import { create } from 'zustand';
import { generateScramble } from '../utils/scrambler';
import type { User } from '@supabase/supabase-js';

interface AppState {
  // ── Timer ──
  activeUserId: number;
  activeCategoryId: string;
  customCategoryName: string;
  currentScramble: string;
  generateNewScramble: (puzzleId?: string) => void;
  setActiveCategory: (id: string, customName?: string) => void;
  setActiveUser: (id: number) => void;

  // ── Auth ──
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Timer defaults ──
  activeUserId: 1,
  activeCategoryId: '3x3',
  customCategoryName: '',
  currentScramble: generateScramble('3x3'),

  generateNewScramble: (puzzleId?: string) => {
    const id = puzzleId || get().activeCategoryId;
    set({
      currentScramble: generateScramble(id),
    });
  },

  setActiveCategory: (id: string, customName?: string) => {
    set({ activeCategoryId: id, customCategoryName: customName || '' });
    get().generateNewScramble(id);
  },

  setActiveUser: (id: number) => {
    set({ activeUserId: id });
  },

  // ── Auth defaults ──
  supabaseUser: null,
  setSupabaseUser: (user) => set({ supabaseUser: user }),
}));
