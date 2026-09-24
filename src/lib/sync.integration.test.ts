import { expect, it, jest } from '@jest/globals';

import { getDatabase, migrate } from './db';
import { enqueue } from './sync';

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
        runAsync: async (source: string, ...params: unknown[]) => {
          const args = Array.isArray(params[0]) ? params[0] : params;
          database.prepare(source).run(...(args as []));
        },
        getAllAsync: async (source: string, ...params: unknown[]) => {
          const args = Array.isArray(params[0]) ? params[0] : params;
          return database.prepare(source).all(...(args as []));
        },
      };
    },
  };
});

it('stores table, row id, and payload for each user table', async () => {
  const rows = [
    { table: 'programs', rowId: 'program-1', payload: '{"status":"draft"}' },
    { table: 'program_day_exercises', rowId: 'day-1', payload: '{"plannedSets":3}' },
    { table: 'sessions', rowId: 'session-1', payload: '{"status":"in_progress"}' },
    { table: 'set_logs', rowId: 'set-1', payload: '{"kg":20,"reps":8}' },
    { table: 'rest_preferences', rowId: 'user-1', payload: '{"defaultSeconds":90}' },
  ];

  for (const row of rows) {
    await enqueue(row);
  }

  const database = await getDatabase();
  const stored = await database.getAllAsync<{ table: string; row_id: string; payload: string }>(
    'SELECT "table", row_id, payload FROM outbox ORDER BY row_id',
  );

  expect(stored).toEqual([
    { table: 'program_day_exercises', row_id: 'day-1', payload: '{"plannedSets":3}' },
    { table: 'programs', row_id: 'program-1', payload: '{"status":"draft"}' },
    { table: 'sessions', row_id: 'session-1', payload: '{"status":"in_progress"}' },
    { table: 'set_logs', row_id: 'set-1', payload: '{"kg":20,"reps":8}' },
    { table: 'rest_preferences', row_id: 'user-1', payload: '{"defaultSeconds":90}' },
  ]);
});

it('rejects the exercise catalog', async () => {
  await expect(enqueue({ table: 'exercises', rowId: 'bench-press', payload: '{}' })).rejects.toThrow(
    'catalog',
  );

  await migrate();
  const database = await getDatabase();
  const stored = await database.getAllAsync<{ table: string }>(
    `SELECT "table" FROM outbox WHERE "table" = 'exercises'`,
  );
  expect(stored).toEqual([]);
});
