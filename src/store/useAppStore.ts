import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateScramble } from '../utils/scrambler';
import type { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
}

interface AppState {
  // ── Timer & Context ──
  activeUserId: number;
  activeCategoryId: string;
  customCategoryName: string;
  currentScramble: string;
  activeSessionId: string;
  previousSessionId: string | null;
  sessions: Session[];

  // ── Actions ──
  generateNewScramble: (puzzleId?: string) => void;
  setActiveCategory: (id: string, customName?: string) => void;
  setActiveUser: (id: number) => void;
  
  // ── Session Actions ──
  createSession: (name: string) => void;
  renameSession: (id: string, newName: string) => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;

  // ── Auth ──
  supabaseUser: User | null;
  setSupabaseUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Timer defaults ──
      activeUserId: 1,
      activeCategoryId: '3x3',
      customCategoryName: '',
      currentScramble: generateScramble('3x3'),
      activeSessionId: 'default-3x3',
      previousSessionId: null,
      sessions: [
        {
          id: 'default-3x3',
          name: 'Sesión 1',
          categoryId: '3x3',
          createdAt: new Date().toISOString(),
        }
      ],

      generateNewScramble: (puzzleId?: string) => {
        const id = puzzleId || get().activeCategoryId;
        set({ currentScramble: generateScramble(id) });
      },

      setActiveCategory: (id: string, customName?: string) => {
        const currentSessions = get().sessions;
        // Find or create a default session for this category
        let session = currentSessions.find(s => s.categoryId === id);
        if (!session) {
          session = {
            id: `default-${id}-${Date.now()}`,
            name: 'Sesión 1',
            categoryId: id,
            createdAt: new Date().toISOString(),
          };
          set({ sessions: [...currentSessions, session] });
        }
        
        set({ 
          activeCategoryId: id, 
          customCategoryName: customName || '',
          activeSessionId: session.id,
          previousSessionId: null
        });
        get().generateNewScramble(id);
      },

      setActiveUser: (id: number) => {
        set({ activeUserId: id });
      },

      // ── Session Logic ──
      createSession: (name: string) => {
        const catId = get().activeCategoryId;
        const newSession: Session = {
          id: `sess-${Date.now()}`,
          name,
          categoryId: catId,
          createdAt: new Date().toISOString(),
        };
        set({ sessions: [...get().sessions, newSession], activeSessionId: newSession.id });
      },

      renameSession: (id: string, newName: string) => {
        const newSessions = get().sessions.map(s => 
          s.id === id ? { ...s, name: newName } : s
        );
        set({ sessions: newSessions });
      },

      deleteSession: (id: string) => {
        const sessions = get().sessions;
        if (sessions.length <= 1) return; // Don't delete last session

        const toDelete = sessions.find(s => s.id === id);
        if (!toDelete) return;

        const filtered = sessions.filter(s => s.id !== id);
        
        // If we deleted the active one, pick another from same category or any
        let nextActive = get().activeSessionId;
        if (nextActive === id) {
          const sameCat = filtered.find(s => s.categoryId === toDelete.categoryId);
          nextActive = sameCat ? sameCat.id : (filtered[0]?.id || '');
        }

        set({ sessions: filtered, activeSessionId: nextActive });
      },

      setActiveSession: (id: string) => {
        const currentActive = get().activeSessionId;
        if (id === 'ALL_SESSIONS') {
          set({ activeSessionId: id, previousSessionId: currentActive });
        } else {
          set({ activeSessionId: id, previousSessionId: null });
        }
      },

      // ── Auth ──
      supabaseUser: null,
      setSupabaseUser: (user) => set({ supabaseUser: user }),
    }),
    {
      name: '@cube_app_state',
      storage: createJSONStorage(() => AsyncStorage),
      // We don't want to persist the current scramble, it should refresh
      partialize: (state) => {
        const { currentScramble, ...rest } = state;
        return rest;
      },
    }
  )
);
