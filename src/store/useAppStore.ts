import { create } from 'zustand';
import { generateScramble } from '../utils/scrambler';

interface AppState {
  activeUserId: number;
  activeCategoryId: string; 
  customCategoryName: string;
  currentScramble: string;
  generateNewScramble: () => void;
  setActiveCategory: (id: string, customName?: string) => void;
  setActiveUser: (id: number) => void;
}

const isGenericScramble = (id: string) => {
  return id === 'custom' || id.includes('ghost') || id.includes('mirror');
};

export const useAppStore = create<AppState>((set, get) => ({
  activeUserId: 1, // Usuario predeterminado
  activeCategoryId: '3x3', // Cubo predeterminado
  customCategoryName: '',
  currentScramble: generateScramble('3x3'),
  
  generateNewScramble: () => {
    const { activeCategoryId } = get();
    if (isGenericScramble(activeCategoryId)) {
      set({ currentScramble: generateScramble('generic') });
    } else {
      set({ currentScramble: generateScramble(activeCategoryId) });
    }
  },
  
  setActiveCategory: (id: string, customName?: string) => {
    set({ 
      activeCategoryId: id,
      customCategoryName: customName || ''
    });
    get().generateNewScramble();
  },

  setActiveUser: (id: number) => {
    set({ activeUserId: id });
  }
}));
