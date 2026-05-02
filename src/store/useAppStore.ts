import { create } from 'zustand';
import { generateScramble } from '../utils/scrambler';
import type { User } from '@supabase/supabase-js';

interface AppState {
  // ── Timer ──
  activeUserId: number;
  activeCategoryId: string;
  customCategoryName: string;
  currentScramble: string;
  generateNewScramble: () => void;
  setActiveCategory: (id: string, customName?: string) => void;
  setActiveUser: (id: number) => void;

  // ── Auth ──
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
}

const isGenericScramble = (id: string) => {
  return id === 'custom' || id.includes('ghost') || id.includes('mirror');
};

export const useAppStore = create<AppState>((set, get) => ({
  // ── Timer defaults ──
  activeUserId: 1,
  activeCategoryId: '3x3',
  customCategoryName: '',
  currentScramble: generateScramble('3x3'),

  generateNewScramble: () => {
    const { activeCategoryId } = get();
    set({
      currentScramble: generateScramble(
        isGenericScramble(activeCategoryId) ? 'generic' : activeCategoryId,
      ),
    });
  },

  setActiveCategory: (id: string, customName?: string) => {
    set({ activeCategoryId: id, customCategoryName: customName || '' });
    get().generateNewScramble();
  },

  setActiveUser: (id: number) => {
    set({ activeUserId: id });
  },

  // ── Auth defaults ──
  supabaseUser: null,
  setSupabaseUser: (user) => set({ supabaseUser: user }),
}));
