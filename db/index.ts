import "dotenv/config";
import type { Job } from "../index";

// ---------------------------------------------------------------------------
// Driver selection
// ---------------------------------------------------------------------------

let _pgPool: import("pg").Pool | null = null;
let _sqlite: import("better-sqlite3").Database | null = null;

export function isPg(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb(): { pool: import("pg").Pool } | { db: import("better-sqlite3").Database } {
  if (isPg()) {
    if (!_pgPool) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require("pg") as typeof import("pg");
      _pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    }
    return { pool: _pgPool };
  } else {
    if (!_sqlite) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Database = require("better-sqlite3") as typeof import("better-sqlite3");
      const path = require("path") as typeof import("path");
      const dbPath = path.join(process.cwd(), "jobs.db");
      _sqlite = new Database(dbPath);
    }
    return { db: _sqlite };
  }
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export async function initDb(): Promise<void> {
  const { migrate } = await import("./migrate");
  await migrate();
}

// ---------------------------------------------------------------------------
// Query helpers
// Two SQL strings handle the one real dialect difference:
//   GROUP_CONCAT (SQLite) vs STRING_AGG (Postgres)
// All date filtering uses JS-computed ISO strings passed as params,
// so no date function differences to worry about.
// ---------------------------------------------------------------------------

export async function queryRows<T = Record<string, unknown>>(
  sqliteSql: string,
  pgSql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (isPg()) {
    const { pool } = getDb() as { pool: import("pg").Pool };
    const result = await pool.query(pgSql, params);
    return result.rows as T[];
  } else {
    const { db } = getDb() as { db: import("better-sqlite3").Database };
    return db.prepare(sqliteSql).all(...params) as T[];
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sqliteSql: string,
  pgSql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await queryRows<T>(sqliteSql, pgSql, params);
  return rows[0];
}

// ---------------------------------------------------------------------------
// Job-specific helpers
// ---------------------------------------------------------------------------

export async function isJobKnown(jobId: string): Promise<boolean> {
  const row = await queryOne<{ found: number }>(
    "SELECT 1 as found FROM jobs WHERE id = ?",
    "SELECT 1 as found FROM jobs WHERE id = $1",
    [jobId]
  );
  return row !== undefined;
}

export async function saveJob(job: Job): Promise<void> {
  const now = new Date().toISOString();
  if (isPg()) {
    const { pool } = getDb() as { pool: import("pg").Pool };
    await pool.query(
      `INSERT INTO jobs (id, company, title, location, url, department, first_seen, last_seen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET last_seen = $8, is_active = 1`,
      [job.id, job.company, job.title, job.location || "", job.url, job.department || "", now, now]
    );
  } else {
    const { db } = getDb() as { db: import("better-sqlite3").Database };
    db.prepare(
      `INSERT INTO jobs (id, company, title, location, url, department, first_seen, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET last_seen = ?, is_active = 1`
    ).run(job.id, job.company, job.title, job.location || "", job.url, job.department || "", now, now, now);
  }
}
