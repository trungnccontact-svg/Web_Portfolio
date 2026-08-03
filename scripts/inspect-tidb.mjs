/**
 * Inspect all rows in TiDB kv_store
 * Run: node --env-file=.env.local scripts/inspect-tidb.mjs
 */
import mysql from "mysql2/promise";

const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  connectionLimit: 1,
});

const [rows] = await pool.execute(
  "SELECT `key`, `owner_email`, JSON_LENGTH(`value`) AS record_count, `updated_at` FROM kv_store ORDER BY `key`"
);

console.log("\n📋 ALL rows in kv_store:\n");
console.table(rows);

// Print full content of each row
for (const row of rows) {
  const [detail] = await pool.execute("SELECT `value` FROM kv_store WHERE `key` = ?", [row.key]);
  const parsed = JSON.parse(detail[0].value);
  console.log(`\n${"═".repeat(70)}`);
  console.log(`🔑 KEY: "${row.key}"`);
  console.log(`👤 OWNER: ${row.owner_email}`);
  console.log(`📦 RECORDS: ${parsed.length}`);
  parsed.forEach((item, i) => {
    const id = item.id || `item-${i}`;
    const title = item.title || item.content?.slice(0, 50) || "(no title)";
    console.log(`  [${i + 1}] ${id}: ${title}`);
  });
}

await pool.end();
