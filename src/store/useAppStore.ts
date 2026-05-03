import { create } from 'zustand';
import { generateScramble } from '../utils/scrambler';
import type { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
}

const SESSIONS_KEY = '@cube_sessions';

interface AppState {
  // ── Timer & Context ──
  activeUserId: number;
  activeCategoryId: string;
  customCategoryName: string;
  currentScramble: string;
  activeSessionId: string;
  sessions: Session[];

  // ── Actions ──
  generateNewScramble: (puzzleId?: string) => void;
  setActiveCategory: (id: string, customName?: string) => void;
  setActiveUser: (id: number) => void;
  
  // ── Session Actions ──
  loadSessions: () => Promise<void>;
  createSession: (name: string) => void;
  renameSession: (id: string, newName: string) => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;

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
  activeSessionId: 'default-3x3',
  sessions: [],

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
      const newSessions = [...currentSessions, session];
      set({ sessions: newSessions });
      AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    }
    
    set({ 
      activeCategoryId: id, 
      customCategoryName: customName || '',
      activeSessionId: session.id 
    });
    get().generateNewScramble(id);
  },

  setActiveUser: (id: number) => {
    set({ activeUserId: id });
  },

  // ── Session Logic ──
  loadSessions: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions: Session[] = raw ? JSON.parse(raw) : [];
      
      // Ensure at least one session exists for the current category
      const catId = get().activeCategoryId;
      let activeId = get().activeSessionId;

      if (!sessions.find(s => s.categoryId === catId)) {
        const defaultSession = {
          id: `default-${catId}`,
          name: 'Sesión 1',
          categoryId: catId,
          createdAt: new Date().toISOString(),
        };
        sessions.push(defaultSession);
        activeId = defaultSession.id;
      } else if (!sessions.find(s => s.id === activeId)) {
        activeId = sessions.find(s => s.categoryId === catId)!.id;
      }

      set({ sessions, activeSessionId: activeId });
      if (raw !== JSON.stringify(sessions)) {
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (e) {
      console.warn('Error loading sessions:', e);
    }
  },

  createSession: (name: string) => {
    const catId = get().activeCategoryId;
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      name,
      categoryId: catId,
      createdAt: new Date().toISOString(),
    };
    const newSessions = [...get().sessions, newSession];
    set({ sessions: newSessions, activeSessionId: newSession.id });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
  },

  renameSession: (id: string, newName: string) => {
    const newSessions = get().sessions.map(s => 
      s.id === id ? { ...s, name: newName } : s
    );
    set({ sessions: newSessions });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
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
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },

  setActiveSession: (id: string) => {
    set({ activeSessionId: id });
  },

  // ── Auth defaults ──
  supabaseUser: null,
  setSupabaseUser: (user) => set({ supabaseUser: user }),
}));
