import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export const saveSolve = async (userId: number, categoryId: string, timeInMillis: number, scramble: string) => {
  if (Platform.OS === 'web') return;
  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    const date = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO SolveRecords (userId, categoryId, time, scramble, date) VALUES (?, ?, ?, ?, ?)',
      [userId, categoryId, timeInMillis, scramble, date]
    );
  } catch (error) {
    console.error("Error saving solve:", error);
  }
};

export const getSolves = async (userId: number, categoryId: string) => {
  if (Platform.OS === 'web') return [];
  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    const allRows = await db.getAllAsync(
      'SELECT * FROM SolveRecords WHERE userId = ? AND categoryId = ? ORDER BY id DESC',
      [userId, categoryId]
    );
    return allRows;
  } catch (error) {
    console.error("Error getting solves:", error);
    return [];
  }
};

export const deleteSolve = async (solveId: number) => {
  if (Platform.OS === 'web') return;
  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    await db.runAsync('DELETE FROM SolveRecords WHERE id = ?', [solveId]);
  } catch (error) {
    console.error("Error deleting solve:", error);
  }
};
