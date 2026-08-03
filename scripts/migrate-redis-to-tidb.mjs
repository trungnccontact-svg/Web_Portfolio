/**
 * Redis → TiDB Migration Script
 * 
 * Step 1: Reads ALL data from the old Redis instance.
 * Step 2: Saves a local JSON backup file (redis-backup.json).
 * Step 3: Seeds the data into TiDB, tied to the owner email.
 *
 * Usage:
 *   1. Fill in DATABASE_URL with the real password in .env.local
 *   2. node --env-file=.env.local scripts/migrate-redis-to-tidb.mjs
 */

import Redis from "ioredis";
import mysql from "mysql2/promise";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────
const REDIS_URL = "redis://default:oav99ODdUDRtnB8aDBRlFmJeNrjtGycf@superclear-frogs-locket-14526.db.redis.io:12342";
const OWNER_EMAIL = "trungnc.contact@gmail.com";
const KEYS = ["portfolio:notepad_notes", "portfolio:artifacts"];
// ─────────────────────────────────────────────────────────────────────────────

async function readFromRedis() {
  console.log("🔌 [Redis] Connecting...");
  const client = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, connectTimeout: 10000 });
  const backup = {};

  try {
    await client.ping();
    console.log("✅ [Redis] Connected.");

    for (const key of KEYS) {
      const raw = await client.get(key);
      if (raw) {
        backup[key] = JSON.parse(raw);
        console.log(`📦 [Redis] "${key}" → ${backup[key].length} records`);
      } else {
        console.log(`⚠️  [Redis] "${key}" is empty / not found.`);
        backup[key] = [];
      }
    }
  } finally {
    await client.quit();
    console.log("🔌 [Redis] Disconnected.\n");
  }

  return backup;
}

async function seedToTiDB(backup) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("<PASSWORD>")) {
    console.error("❌ DATABASE_URL is missing or still has <PASSWORD> placeholder.");
    console.error("   Please fill in the real password in .env.local and re-run.");
    process.exit(1);
  }

  console.log("🔌 [TiDB] Connecting...");
  const pool = await mysql.createPool({
    uri: databaseUrl,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionLimit: 5,
  });

  try {
    // Create tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        \`owner_email\` VARCHAR(255) DEFAULT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ [TiDB] Table kv_store ready.");

    // Seed each key
    for (const key of KEYS) {
      const value = JSON.stringify(backup[key]);
      await pool.execute(
        `INSERT INTO kv_store (\`key\`, \`value\`, \`owner_email\`)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE \`value\` = ?, \`owner_email\` = ?`,
        [key, value, OWNER_EMAIL, value, OWNER_EMAIL]
      );
      console.log(`✅ [TiDB] Seeded "${key}" (${backup[key].length} records) → owner: ${OWNER_EMAIL}`);
    }

    console.log("\n🎉 Migration complete!");
  } finally {
    await pool.end();
    console.log("🔌 [TiDB] Disconnected.");
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("   Redis → TiDB Migration");
  console.log("═══════════════════════════════════════════\n");

  // Step 1: Read from Redis
  const backup = await readFromRedis();

  // Step 2: Save local JSON backup
  const backupPath = join(__dirname, "redis-backup.json");
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");
  console.log(`💾 Backup saved to: ${backupPath}\n`);

  // Step 3: Seed to TiDB
  await seedToTiDB(backup);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
