/**
 * TiDB Connection Test
 * Run: node --env-file=.env.local scripts/test-tidb.mjs
 */
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
console.log("🔍 DATABASE_URL:", url ? url.replace(/:([^:@]+)@/, ":***@") : "NOT SET");

if (!url) {
  console.error("❌ DATABASE_URL is not set in .env.local");
  process.exit(1);
}

try {
  console.log("\n🔌 Connecting to TiDB...");
  const pool = await mysql.createPool({
    uri: url,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionLimit: 1,
  });

  const [rows] = await pool.execute("SELECT VERSION() AS version, NOW() AS now");
  console.log("✅ Connected!");
  console.log("   MySQL version:", rows[0].version);
  console.log("   Server time:  ", rows[0].now);

  // Test CREATE TABLE
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS kv_store (
      \`key\` VARCHAR(255) PRIMARY KEY,
      \`value\` LONGTEXT NOT NULL,
      \`owner_email\` VARCHAR(255) DEFAULT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table kv_store exists / created.");

  // Verify table
  const [tables] = await pool.execute("SHOW TABLES LIKE 'kv_store'");
  console.log("✅ Table verified:", tables.length > 0 ? "EXISTS" : "NOT FOUND");

  await pool.end();
  console.log("\n🎉 TiDB connection is healthy and ready!");

} catch (err) {
  console.error("\n❌ TiDB connection failed:");
  console.error("  ", err.message);
  if (err.code) console.error("   Code:", err.code);
  process.exit(1);
}
