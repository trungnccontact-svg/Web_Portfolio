/**
 * TiDB Setup: Create database "portfolio" and test kv_store table
 * Run: node --env-file=.env.local scripts/setup-tidb-db.mjs
 */
import mysql from "mysql2/promise";

// Connect without a specific database to create the one we want
const url = process.env.DATABASE_URL;
const baseUrl = url.replace("/sys", "/"); // connect to root, no db selected

console.log("🔌 Connecting to TiDB (root level)...");
const pool = await mysql.createPool({
  uri: baseUrl,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  connectionLimit: 1,
});

try {
  // Step 1: Create database "portfolio"
  await pool.execute("CREATE DATABASE IF NOT EXISTS portfolio;");
  console.log("✅ Database 'portfolio' created / already exists.");

  // Step 2: Use portfolio db and create table
  await pool.execute("USE portfolio;");
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS kv_store (
      \`key\` VARCHAR(255) PRIMARY KEY,
      \`value\` LONGTEXT NOT NULL,
      \`owner_email\` VARCHAR(255) DEFAULT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table 'portfolio.kv_store' created / already exists.");

  // Verify
  const [rows] = await pool.execute("SHOW TABLES IN portfolio;");
  console.log("📦 Tables in 'portfolio':", rows.map(r => Object.values(r)[0]));
  
  console.log("\n🎉 Setup complete!");
  console.log("👉 Update DATABASE_URL in .env.local:");
  const newUrl = url.replace("/sys", "/portfolio");
  console.log(`   DATABASE_URL="${newUrl}"`);

} catch (err) {
  console.error("❌ Error:", err.message, "Code:", err.code);
} finally {
  await pool.end();
}
