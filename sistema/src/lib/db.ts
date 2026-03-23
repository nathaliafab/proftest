import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
const url = isTest 
  ? `:memory:` 
  : (process.env.DATABASE_URL || 'file:database.sqlite');

const client = createClient({ url });
export const db = drizzle(client, { schema });

let initPromise: Promise<any> | null = null;

export async function getDb() {
  if (!initPromise) {
    initPromise = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          answers TEXT NOT NULL
        )
      `);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS tests (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          questions TEXT NOT NULL
        )
      `);
    })();
  }
  await initPromise;
  return db;
}

export async function clearDb(): Promise<void> {
  const database = await getDb();
  await database.delete(schema.questionsTable);
  await database.delete(schema.testsTable);
}
