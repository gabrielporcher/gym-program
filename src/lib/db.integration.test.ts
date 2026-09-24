import { expect, it, jest } from '@jest/globals';

import { getDatabase, migrate } from './db';

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
