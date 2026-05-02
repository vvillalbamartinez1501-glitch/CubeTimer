// db.ts — SQLite initialization removed.
// Persistence is now handled by AsyncStorage (see operations.ts).
// This file is kept as a no-op stub so that any remaining import of
// `initDB` does not break the build during the migration.

/** @deprecated No-op — AsyncStorage needs no schema initialization. */
export const initDB = async (): Promise<void> => {
  // Nothing to do.
};