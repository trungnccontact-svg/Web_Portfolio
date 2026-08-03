/**
 * Re-seed TiDB with user-scoped keys
 * Migrates from global keys → per-user keys for trungnc.contact@gmail.com
 *
 * Run: node --env-file=.env.local scripts/reseed-user-scoped.mjs
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OWNER_EMAIL = "trungnc.contact@gmail.com";

// Load the backup we made from Redis
const backupPath = join(__dirname, "redis-backup.json");
const backup = JSON.parse(readFileSync(backupPath, "utf-8"));

console.log("📦 Loaded backup:");
console.log("  notepad_notes:", backup["portfolio:notepad_notes"]?.length, "records");
console.log("  artifacts:    ", backup["portfolio:artifacts"]?.length, "records");

const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  connectionLimit: 5,
});

// New user-scoped keys
const migrations = [
  {
    oldKey: "portfolio:notepad_notes",
    newKey: `portfolio:notepad_notes:${OWNER_EMAIL}`,
    data: backup["portfolio:notepad_notes"],
  },
  {
    oldKey: "portfolio:artifacts",
    newKey: `portfolio:artifacts:${OWNER_EMAIL}`,
    data: backup["portfolio:artifacts"],
  },
];

for (const m of migrations) {
  const value = JSON.stringify(m.data);
  await pool.execute(
    "INSERT INTO kv_store (`key`, `value`, `owner_email`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `value` = ?, `owner_email` = ?",
    [m.newKey, value, OWNER_EMAIL, value, OWNER_EMAIL]
  );
  console.log(`\n✅ Seeded: "${m.newKey}"`);
  console.log(`   Records: ${m.data.length}`);
  console.log(`   Owner:   ${OWNER_EMAIL}`);
}

// Optionally verify
const [rows] = await pool.execute("SELECT `key`, `owner_email`, JSON_LENGTH(`value`) AS cnt FROM kv_store ORDER BY `key`");
console.log("\n📋 All rows in kv_store:");
console.table(rows);

await pool.end();
console.log("\n🎉 Re-seed complete! Old global keys preserved, new user-scoped keys added.");
