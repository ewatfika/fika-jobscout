import { getDb, isPg } from "./index";

export async function migrate(): Promise<void> {
  const schema = `
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT,
      url TEXT NOT NULL,
      department TEXT,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `;

  if (isPg()) {
    const { pool } = getDb() as { pool: import("pg").Pool };
    await pool.query(schema);
  } else {
    const { db } = getDb() as { db: import("better-sqlite3").Database };
    db.exec(schema);
  }
}
