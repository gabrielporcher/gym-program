import { getDatabase, migrate } from './db';

const OUTBOX_TABLES = [
  'programs',
  'program_day_exercises',
  'sessions',
  'set_logs',
  'rest_preferences',
] as const;

export type OutboxTable = (typeof OUTBOX_TABLES)[number];

export interface SyncRow {
  table: string;
  rowId: string;
  payload: string;
}

export async function enqueue(row: SyncRow): Promise<void> {
  if (!OUTBOX_TABLES.includes(row.table as OutboxTable)) {
    throw new Error(`The catalog is not an outbox table: ${row.table}`);
  }

  await migrate();
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO outbox (id, "table", row_id, payload) VALUES (?, ?, ?, ?)',
    crypto.randomUUID(),
    row.table,
    row.rowId,
    row.payload,
  );
}
