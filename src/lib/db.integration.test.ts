import { expect, it, jest } from '@jest/globals';

import { getDatabase, getExercise, listExercises, migrate, supabaseExerciseSeedSql } from './db';

jest.mock('expo-sqlite', () => {
  const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
  const databases = new Map<string, InstanceType<typeof DatabaseSync>>();

  return {
    openDatabaseAsync: async (name: string) => {
      let database = databases.get(name);
      if (!database) {
        database = new DatabaseSync(':memory:');
        databases.set(name, database);
      }

      return {
        execAsync: async (source: string) => {
          database.exec(source);
        },
        getAllAsync: async (source: string, ...params: unknown[]) => {
          const args = Array.isArray(params[0]) ? params[0] : params;
          return database.prepare(source).all(...(args as []));
        },
      };
    },
  };
});

const USER_TABLES = [
  'exercises',
  'outbox',
  'program_day_exercises',
  'programs',
  'rest_preferences',
  'sessions',
  'set_logs',
];

it('creates the user tables', async () => {
    await migrate();
    const database = await getDatabase();
    const rows = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );

    expect(rows.map((row) => row.name)).toEqual(USER_TABLES);
  });

const SEED_IDS = ['back-squat', 'barbell-row', 'bench-press', 'deadlift', 'overhead-press'];

it('returns the bench press with chest 5, triceps 3, and shoulder 4', async () => {
  const exercise = await getExercise('bench-press');

  expect(exercise.id).toBe('bench-press');
  expect(exercise.muscles).toEqual([
    { muscle: 'chest', role: 'agonist', emphasis: 5 },
    { muscle: 'triceps', role: 'synergist', emphasis: 3 },
    { muscle: 'shoulder', role: 'synergist', emphasis: 4 },
  ]);
});

it('lists only the seeded catalog ids', async () => {
  const exercises = await listExercises();

  expect(exercises.map((exercise) => exercise.id)).toEqual(SEED_IDS);
  for (const id of SEED_IDS) {
    expect(supabaseExerciseSeedSql()).toContain(`'${id}'`);
  }
});

it('stores emphasis from 1 to 5 and an agonist or synergist role', async () => {
  const exercises = await listExercises();

  for (const exercise of exercises) {
    expect(exercise.muscles.length).toBeGreaterThan(0);
    for (const muscle of exercise.muscles) {
      expect(Number.isInteger(muscle.emphasis)).toBe(true);
      expect(muscle.emphasis).toBeGreaterThanOrEqual(1);
      expect(muscle.emphasis).toBeLessThanOrEqual(5);
      expect(muscle.role === 'agonist' || muscle.role === 'synergist').toBe(true);
    }
  }
});
