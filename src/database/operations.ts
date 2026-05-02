import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Definimos la estructura de cómo nos devolverá la base de datos un Solve
export interface SolveRecord {
  id: number;
  userId: number;
  categoryId: string;
  time: number;
  scramble: string;
  date: string;
}

// 1. GUARDAR UN TIEMPO (Ya te la había pasado, la mantenemos aquí)
export const saveSolve = async (
  userId: number, 
  categoryId: string, 
  time: number, 
  scramble: string
) => {
  if (Platform.OS === 'web') {
    console.log('Guardado simulado en web (SQLite desactivado).');
    return;
  }

  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    const date = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO SolveRecords (userId, categoryId, time, scramble, date) VALUES (?, ?, ?, ?, ?)',
      [userId, categoryId, time, scramble, date]
    );
    
    console.log("¡Solve guardado en la base de datos correctamente!");
  } catch (error) {
    console.error("Error crítico al guardar:", error);
  }
};

// 2. OBTENER TODOS LOS TIEMPOS (Necesario para el Historial)
// Permite filtrar por usuario y categoría. Ordena del más reciente al más antiguo.
export const getSolves = async (
  userId: number, 
  categoryId: string
): Promise<SolveRecord[]> => {
  if (Platform.OS === 'web') {
    console.log('Lectura simulada en web (Devolviendo array vacío).');
    return [];
  }

  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    
    // getAllAsync devuelve un array con todos los resultados
    const result = await db.getAllAsync<SolveRecord>(
      'SELECT * FROM SolveRecords WHERE userId = ? AND categoryId = ? ORDER BY id DESC',
      [userId, categoryId]
    );
    
    return result;
  } catch (error) {
    console.error("Error al obtener los solves:", error);
    return [];
  }
};

// 3. ELIMINAR UN TIEMPO ESPECÍFICO (Necesario para la pantalla de Historial)
export const deleteSolve = async (solveId: number) => {
  if (Platform.OS === 'web') {
    console.log(`Borrado simulado del solve ${solveId} en web.`);
    return;
  }

  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    
    await db.runAsync(
      'DELETE FROM SolveRecords WHERE id = ?',
      [solveId]
    );
    
    console.log(`Solve con ID ${solveId} eliminado correctamente.`);
  } catch (error) {
    console.error(`Error al eliminar el solve ${solveId}:`, error);
  }
};