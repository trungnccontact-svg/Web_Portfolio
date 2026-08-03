/**
 * Redis Data Recovery Script
 * Connects to the OLD Redis URL and reads the existing data,
 * then reports what was found so we can decide how to seed TiDB.
 *
 * Run: node --env-file=.env.local scripts/recover-redis-data.mjs
 */

import Redis from "ioredis";

const REDIS_URL = "redis://default:oav99ODdUDRtnB8aDBRlFmJeNrjtGycf@superclear-frogs-locket-14526.db.redis.io:12342";

const KEYS = [
  "portfolio:notepad_notes",
  "portfolio:artifacts",
];

async function main() {
  console.log("🔌 Connecting to Redis...");
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    connectTimeout: 10000,
  });

  client.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
  });

  try {
    // Ping to verify connection
    const pong = await client.ping();
    console.log("✅ Redis ping:", pong);

    for (const key of KEYS) {
      console.log(`\n📦 Reading key: ${key}`);
      const raw = await client.get(key);
      if (!raw) {
        console.log(`   ⚠️  Key "${key}" does NOT exist (null).`);
      } else {
        const parsed = JSON.parse(raw);
        console.log(`   ✅ Found ${Array.isArray(parsed) ? parsed.length : 1} record(s).`);
        console.log("   📄 Data preview:");
        console.log(JSON.stringify(parsed, null, 2).slice(0, 2000));
        if (JSON.stringify(parsed).length > 2000) console.log("   ... (truncated)");
      }
    }
  } catch (err) {
    console.error("❌ Error during recovery:", err);
  } finally {
    await client.quit();
    console.log("\n🔌 Redis connection closed.");
  }
}

main();
