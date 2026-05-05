import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Local storage key ────────────────────────────────────────────────────────
const STORAGE_KEY = '@cube_solves';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SolveRecord {
  id: number;         // timestamp-based local ID
  userId: number;     // local numeric user ID
  categoryId: string;
  sessionId: string;  
  time: number;       // milliseconds
  scramble: string;
  date: string;       // ISO string
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
const _loadAll = async (): Promise<SolveRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SolveRecord[]) : [];
  } catch {
    return [];
  }
};

const _saveAll = async (solves: SolveRecord[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
};

// ─── 1. GUARDAR UN TIEMPO ─────────────────────────────────────────────────────
export const saveSolve = async (
  userId: number,
  categoryId: string,
  time: number,
  scramble: string,
  sessionId: string,
): Promise<void> => {
  const id = Date.now();
  const date = new Date().toISOString();

  const newSolve: SolveRecord = {
    id,
    userId,
    categoryId,
    sessionId,
    time,
    scramble,
    date,
  };

  const all = await _loadAll();
  all.push(newSolve);
  await _saveAll(all);
};

// ─── 2. OBTENER TIEMPOS ───────────────────────────────────────────────────────
export const getSolves = async (
  userId: number,
  categoryId: string,
  sessionId?: string,
): Promise<SolveRecord[]> => {
  const isAllSessions = sessionId === 'ALL_SESSIONS';

  const all = await _loadAll();
  return all
    .filter(s => 
      s.userId === userId && 
      s.categoryId === categoryId && 
      (!sessionId || isAllSessions || s.sessionId === sessionId || (!s.sessionId && sessionId === 'default'))
    )
    .sort((a, b) => b.id - a.id);
};

// ─── 3. ELIMINAR UN TIEMPO ────────────────────────────────────────────────────
export const deleteSolve = async (solveId: number): Promise<void> => {
  const all = await _loadAll();
  await _saveAll(all.filter(s => s.id !== solveId));
};

// ─── ELIMINAR TODA UNA SESIÓN ────────────────────────────────────────────────
export const clearSessionSolves = async (
  userId: number,
  categoryId: string,
  sessionId: string,
): Promise<void> => {
  const isAllSessions = sessionId === 'ALL_SESSIONS';

  const all = await _loadAll();
  const filtered = all.filter(s => {
    const matchCategory = s.userId === userId && s.categoryId === categoryId;
    if (isAllSessions) return !matchCategory;
    return !(matchCategory && s.sessionId === sessionId);
  });
  
  await _saveAll(filtered);
};

// ─── 4. TOTAL SOLVES (for achievements) ──────────────────────────────────────
export const getTotalSolves = async (userId: number): Promise<number> => {
  const all = await _loadAll();
  return all.filter(s => s.userId === userId).length;
};

export const getCategorySolveCount = async (
  userId: number,
  categoryId: string,
): Promise<number> => {
  const all = await _loadAll();
  return all.filter(s => s.userId === userId && s.categoryId === categoryId).length;
};