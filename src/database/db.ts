import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const initDB = async () => {
  // Si estamos en la web, simulamos que todo salió bien y no hacemos nada
  if (Platform.OS === 'web') {
    console.warn("⚠️ Ejecutando en Web: SQLite está desactivado para evitar errores de SharedArrayBuffer. Los datos no se guardarán.");
    return null;
  }

  // Si estamos en un dispositivo móvil real (o emulador), usamos SQLite
  try {
    const db = await SQLite.openDatabaseAsync('cubetimer.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
      CREATE TABLE IF NOT EXISTS Categories (id TEXT PRIMARY KEY, name TEXT);
      CREATE TABLE IF NOT EXISTS SolveRecords (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        userId INTEGER, 
        categoryId TEXT, 
        time INTEGER, 
        scramble TEXT, 
        date TEXT
      );
    `);
    
    return db;
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    return null;
  }
};