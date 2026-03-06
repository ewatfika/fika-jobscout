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
      is_active INTEGER DEFAULT 1,
      salary TEXT
    )
  `;

  if (isPg()) {
    const { pool } = getDb() as { pool: import("pg").Pool };
    await pool.query(schema);
    // Add salary column to existing tables
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary TEXT`);
  } else {
    const { db } = getDb() as { db: import("better-sqlite3").Database };
    db.exec(schema);
    try { db.exec(`ALTER TABLE jobs ADD COLUMN salary TEXT`); } catch { /* already exists */ }
  }
}
