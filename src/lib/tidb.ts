import mysql from "mysql2/promise";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbState {
  pool: mysql.Pool | undefined;
  tableReady: boolean;
}

// ─── Singleton pool (survives hot-reloads in dev) ─────────────────────────────

const globalForDb = globalThis as unknown as { __db: DbState };
if (!globalForDb.__db) {
  globalForDb.__db = { pool: undefined, tableReady: false };
}

function getPool(): mysql.Pool {
  if (globalForDb.__db.pool) {
    return globalForDb.__db.pool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const pool = mysql.createPool({
    uri: databaseUrl,
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  globalForDb.__db.pool = pool;
  return pool;
}

// ─── One-time table init (called once per process, not per request) ────────────

async function initTableOnce(pool: mysql.Pool): Promise<void> {
  if (globalForDb.__db.tableReady) return;

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        \`owner_email\` VARCHAR(255) DEFAULT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("[TiDB] kv_store table ready.");
  } catch (err: any) {
    // If the user doesn't have DDL privileges (table was pre-created by admin script),
    // log a warning but do NOT crash — the table already exists.
    if (err?.code === "ER_TABLEACCESS_DENIED_ERROR" || err?.code === "ER_ACCESS_DENIED_ERROR") {
      console.warn("[TiDB] Cannot CREATE TABLE (no DDL permission) — assuming table already exists.");
    } else {
      // Unknown error — re-throw
      throw err;
    }
  }

  globalForDb.__db.tableReady = true;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function dbGet(key: string): Promise<string | null> {
  const pool = getPool();
  await initTableOnce(pool);
  const [rows] = await pool.execute("SELECT `value` FROM kv_store WHERE `key` = ?", [key]);
  const results = rows as any[];
  return results.length > 0 ? results[0].value : null;
}

export async function dbSet(key: string, value: string): Promise<void> {
  const pool = getPool();
  await initTableOnce(pool);
  await pool.execute(
    "INSERT INTO kv_store (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
    [key, value, value]
  );
}

