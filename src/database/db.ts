import * as SQLite from 'expo-sqlite';

// Abrimos (o creamos) la base de datos de manera sincrónica (Expo SQLite SDK 50+)
export const db = SQLite.openDatabaseSync('cubetimer.db');

export const initDB = () => {
  // Ejecutamos las consultas para la creación de tablas
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PuzzleCategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS SolveRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      timeMs INTEGER NOT NULL,
      scramble TEXT NOT NULL,
      penalty TEXT DEFAULT 'NONE', -- 'NONE', 'PLUS_TWO', 'DNF'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES PuzzleCategories (id) ON DELETE CASCADE
    );

    -- Insertamos los puzzles por defecto
    INSERT OR IGNORE INTO PuzzleCategories (name) VALUES ('3x3'), ('2x2'), ('4x4'), ('Pyraminx'), ('Megaminx');
    
    -- Insertamos un usuario por defecto si no existe
    INSERT OR IGNORE INTO Users (id, name) VALUES (1, 'Jugador 1');
  `);
};
