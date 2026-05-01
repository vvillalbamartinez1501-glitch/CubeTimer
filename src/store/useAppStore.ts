import { create } from 'zustand';
import { generateScramble } from '../utils/scrambler';

interface AppState {
  activeUserId: number;
  activeCategoryId: number; // 1 = 3x3, 3 = 4x4, etc.
  currentScramble: string;
  generateNewScramble: () => void;
  setActiveCategory: (id: number) => void;
  setActiveUser: (id: number) => void;
}

// Convert category ID to cube type based on our default inserts
const getCubeTypeFromCategory = (categoryId: number): '3x3' | '4x4' => {
  // Según nuestros INSERTS en SQLite: 1: 3x3, 2: 2x2, 3: 4x4
  if (categoryId === 3) return '4x4';
  return '3x3'; 
};

export const useAppStore = create<AppState>((set, get) => ({
  activeUserId: 1, // Default user
  activeCategoryId: 1, // Default to 3x3
  currentScramble: generateScramble('3x3'),
  
  generateNewScramble: () => {
    const { activeCategoryId } = get();
    const cubeType = getCubeTypeFromCategory(activeCategoryId);
    set({ currentScramble: generateScramble(cubeType) });
  },
  
  setActiveCategory: (id: number) => {
    set({ activeCategoryId: id });
    get().generateNewScramble(); // Ensure scramble matches new category
  },

  setActiveUser: (id: number) => {
    set({ activeUserId: id });
  }
}));
