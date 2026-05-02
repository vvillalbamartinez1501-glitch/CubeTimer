import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = '@cube_solves';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SolveRecord {
  id: number;
  userId: number;
  categoryId: string;
  time: number;       // milliseconds
  scramble: string;
  date: string;       // ISO string
}

// ─── Internal helper: load the full array ────────────────────────────────────
const _loadAll = async (): Promise<SolveRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SolveRecord[]) : [];
  } catch {
    return [];
  }
};

// ─── Internal helper: persist the full array ─────────────────────────────────
const _saveAll = async (solves: SolveRecord[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(solves));
};

// ─── 1. GUARDAR UN TIEMPO ─────────────────────────────────────────────────────
export const saveSolve = async (
  userId: number,
  categoryId: string,
  time: number,
  scramble: string,
): Promise<void> => {
  try {
    const all = await _loadAll();

    const newSolve: SolveRecord = {
      id: Date.now(),          // unique enough for local storage
      userId,
      categoryId,
      time,
      scramble,
      date: new Date().toISOString(),
    };

    all.push(newSolve);
    await _saveAll(all);
    console.log('✅ Solve guardado en AsyncStorage.');
  } catch (error) {
    console.error('❌ Error al guardar solve:', error);
  }
};

// ─── 2. OBTENER TIEMPOS (filtrado + orden desc) ───────────────────────────────
export const getSolves = async (
  userId: number,
  categoryId: string,
): Promise<SolveRecord[]> => {
  try {
    const all = await _loadAll();

    return all
      .filter(s => s.userId === userId && s.categoryId === categoryId)
      .sort((a, b) => b.id - a.id); // más reciente primero (id = timestamp)
  } catch (error) {
    console.error('❌ Error al obtener solves:', error);
    return [];
  }
};

// ─── 3. ELIMINAR UN TIEMPO ────────────────────────────────────────────────────
export const deleteSolve = async (solveId: number): Promise<void> => {
  try {
    const all = await _loadAll();
    const filtered = all.filter(s => s.id !== solveId);
    await _saveAll(filtered);
    console.log(`🗑️ Solve ${solveId} eliminado de AsyncStorage.`);
  } catch (error) {
    console.error(`❌ Error al eliminar solve ${solveId}:`, error);
  }
};