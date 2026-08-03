/**
 * Quick backup: dump Redis data to redis-backup.json
 */
import Redis from "ioredis";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDIS_URL = "redis://default:oav99ODdUDRtnB8aDBRlFmJeNrjtGycf@superclear-frogs-locket-14526.db.redis.io:12342";
const KEYS = ["portfolio:notepad_notes", "portfolio:artifacts"];

const client = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, connectTimeout: 10000 });
const backup = {};

await client.ping();
for (const key of KEYS) {
  const raw = await client.get(key);
  backup[key] = raw ? JSON.parse(raw) : [];
  console.log(`✅ "${key}": ${backup[key].length} records`);
}
await client.quit();

const out = join(__dirname, "redis-backup.json");
writeFileSync(out, JSON.stringify(backup, null, 2), "utf-8");
console.log(`\n💾 Backup saved to: ${out}`);
