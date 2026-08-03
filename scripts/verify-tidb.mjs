/**
 * Verify TiDB data after migration
 * Run: node --env-file=.env.local scripts/verify-tidb.mjs
 */
import mysql from "mysql2/promise";

const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  connectionLimit: 1,
});

const [rows] = await pool.execute(
  "SELECT `key`, `owner_email`, JSON_LENGTH(`value`) AS record_count, `updated_at` FROM kv_store"
);

console.log("\n📋 TiDB kv_store contents:\n");
console.table(rows.map(r => ({
  key: r.key,
  owner: r.owner_email,
  records: r.record_count,
  updated: r.updated_at,
})));

for (const row of rows) {
  const [detail] = await pool.execute("SELECT `value` FROM kv_store WHERE `key` = ?", [row.key]);
  const parsed = JSON.parse(detail[0].value);
  console.log(`\n🔑 "${row.key}" — first item:`);
  console.log(JSON.stringify(parsed[0], null, 2));
}

await pool.end();
console.log("\n✅ Verification complete.");
