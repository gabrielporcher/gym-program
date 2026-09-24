import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'workout.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return database;
}

export async function migrate(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS program_day_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT NOT NULL,
      day_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      planned_sets INTEGER NOT NULL,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      day_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS set_logs (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      kg REAL NOT NULL,
      reps INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rest_preferences (
      user_id TEXT PRIMARY KEY NOT NULL,
      default_seconds INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      muscles TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY NOT NULL,
      "table" TEXT NOT NULL,
      row_id TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
}
