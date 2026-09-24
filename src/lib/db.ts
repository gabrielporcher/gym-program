import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'workout.db';

export type MuscleRole = 'agonist' | 'synergist';
export type Emphasis = 1 | 2 | 3 | 4 | 5;

export interface Exercise {
  id: string;
  name: string;
  muscles: { muscle: string; role: MuscleRole; emphasis: Emphasis }[];
}

export const EXERCISE_SEED: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Supino reto',
    muscles: [
      { muscle: 'chest', role: 'agonist', emphasis: 5 },
      { muscle: 'triceps', role: 'synergist', emphasis: 3 },
      { muscle: 'shoulder', role: 'synergist', emphasis: 4 },
    ],
  },
  {
    id: 'back-squat',
    name: 'Agachamento',
    muscles: [
      { muscle: 'quadriceps', role: 'agonist', emphasis: 5 },
      { muscle: 'glutes', role: 'synergist', emphasis: 4 },
      { muscle: 'hamstrings', role: 'synergist', emphasis: 3 },
    ],
  },
  {
    id: 'deadlift',
    name: 'Levantamento terra',
    muscles: [
      { muscle: 'hamstrings', role: 'agonist', emphasis: 5 },
      { muscle: 'glutes', role: 'synergist', emphasis: 4 },
      { muscle: 'back', role: 'synergist', emphasis: 4 },
    ],
  },
  {
    id: 'overhead-press',
    name: 'Desenvolvimento',
    muscles: [
      { muscle: 'shoulder', role: 'agonist', emphasis: 5 },
      { muscle: 'triceps', role: 'synergist', emphasis: 3 },
    ],
  },
  {
    id: 'barbell-row',
    name: 'Remada curvada',
    muscles: [
      { muscle: 'back', role: 'agonist', emphasis: 5 },
      { muscle: 'biceps', role: 'synergist', emphasis: 3 },
    ],
  },
];

type ExerciseRow = { id: string; name: string; muscles: string };

function seedSql(): string {
  return EXERCISE_SEED.map((exercise) => {
    const muscles = JSON.stringify(exercise.muscles).replaceAll("'", "''");
    return `INSERT OR IGNORE INTO exercises (id, name, muscles) VALUES ('${exercise.id}', '${exercise.name}', '${muscles}');`;
  }).join('\n');
}

export function supabaseExerciseSeedSql(): string {
  return seedSql();
}

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
    ${seedSql()}
  `);
}

function toExercise(row: ExerciseRow): Exercise {
  return { id: row.id, name: row.name, muscles: JSON.parse(row.muscles) as Exercise['muscles'] };
}

export async function listExercises(): Promise<Exercise[]> {
  await migrate();
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>('SELECT id, name, muscles FROM exercises ORDER BY id');
  return rows.map(toExercise);
}

export async function getExercise(id: string): Promise<Exercise> {
  await migrate();
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>('SELECT id, name, muscles FROM exercises WHERE id = ?', id);
  const row = rows[0];
  if (!row) {
    throw new Error(`Unknown exercise: ${id}`);
  }
  return toExercise(row);
}
