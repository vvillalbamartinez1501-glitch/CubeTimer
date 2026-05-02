import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// ─── Local storage key ────────────────────────────────────────────────────────
const STORAGE_KEY = '@cube_solves';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SolveRecord {
  id: number;         // timestamp-based local ID (also used as remote idempotency key)
  userId: number;     // local numeric user ID (kept for backwards compat)
  categoryId: string;
  time: number;       // milliseconds
  scramble: string;
  date: string;       // ISO string
  synced?: boolean;   // true once confirmed saved in Supabase
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
// Strategy: cloud-first if authenticated, local-first as fallback.
export const saveSolve = async (
  userId: number,
  categoryId: string,
  time: number,
  scramble: string,
): Promise<void> => {
  const id = Date.now();
  const date = new Date().toISOString();

  // Build the local record first
  const newSolve: SolveRecord = {
    id,
    userId,
    categoryId,
    time,
    scramble,
    date,
    synced: false,
  };

  // Try Supabase if there is an active session
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { error } = await supabase.from('solves').insert({
        id: id.toString(),          // uuid-compatible via text cast
        user_id: session.user.id,
        category: categoryId,
        time,
        scramble,
        created_at: date,
      });

      if (!error) {
        newSolve.synced = true;
        console.log('☁️ Solve guardado en Supabase.');
      } else {
        console.warn('⚠️ Supabase insert falló, guardando local:', error.message);
      }
    }
  } catch (networkErr) {
    console.warn('⚠️ Sin red, guardando local:', networkErr);
  }

  // Always persist locally (source of truth for offline use)
  const all = await _loadAll();
  all.push(newSolve);
  await _saveAll(all);
  console.log('✅ Solve guardado en AsyncStorage.');
};

// ─── 2. OBTENER TIEMPOS ───────────────────────────────────────────────────────
// Strategy: fetch from Supabase when authenticated and merge with local.
export const getSolves = async (
  userId: number,
  categoryId: string,
): Promise<SolveRecord[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Fetch remote records
      const { data: remote, error } = await supabase
        .from('solves')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('category', categoryId)
        .order('created_at', { ascending: false });

      if (!error && remote) {
        // Map Supabase rows → SolveRecord shape and persist locally
        const mapped: SolveRecord[] = remote.map((r: any) => ({
          id: Number(r.id) || new Date(r.created_at).getTime(),
          userId,
          categoryId: r.category,
          time: r.time,
          scramble: r.scramble,
          date: r.created_at,
          synced: true,
        }));

        // Merge: keep local-only (unsynced) + remote (authoritative)
        const all = await _loadAll();
        const unsyncedLocal = all.filter(
          s => s.userId === userId && s.categoryId === categoryId && !s.synced,
        );
        const merged = [
          ...mapped,
          ...unsyncedLocal.filter(u => !mapped.some(r => r.id === u.id)),
        ].sort((a, b) => b.id - a.id);

        // Persist the merged set
        const otherSolves = all.filter(
          s => !(s.userId === userId && s.categoryId === categoryId),
        );
        await _saveAll([...otherSolves, ...merged]);

        return merged;
      }
    }
  } catch (networkErr) {
    console.warn('⚠️ No se pudo conectar a Supabase, usando datos locales:', networkErr);
  }

  // Offline / no session: return local only
  const all = await _loadAll();
  return all
    .filter(s => s.userId === userId && s.categoryId === categoryId)
    .sort((a, b) => b.id - a.id);
};

// ─── 3. ELIMINAR UN TIEMPO ────────────────────────────────────────────────────
export const deleteSolve = async (solveId: number): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { error } = await supabase
        .from('solves')
        .delete()
        .eq('id', solveId.toString())
        .eq('user_id', session.user.id);

      if (error) console.warn('⚠️ Error al borrar en Supabase:', error.message);
      else console.log('☁️ Solve eliminado de Supabase.');
    }
  } catch (networkErr) {
    console.warn('⚠️ Error de red al borrar:', networkErr);
  }

  // Always delete locally
  const all = await _loadAll();
  await _saveAll(all.filter(s => s.id !== solveId));
  console.log(`🗑️ Solve ${solveId} eliminado de AsyncStorage.`);
};