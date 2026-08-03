/**
 * Merge + Cleanup TiDB:
 * 1. Merge unique items from account2 artifacts into account1 (trungnc)
 * 2. Delete account2 keys
 * 3. Delete old global keys (portfolio:artifacts, portfolio:notepad_notes)
 *
 * Run: node --env-file=.env.local scripts/merge-and-cleanup.mjs
 */
import mysql from "mysql2/promise";

const OWNER = "trungnc.contact@gmail.com";
const ACCOUNT2 = "nguyenchitrung.210902.junior.it.bd@gmail.com";

const KEY_ARTIFACTS_OWNER  = `portfolio:artifacts:${OWNER}`;
const KEY_ARTIFACTS_ACC2   = `portfolio:artifacts:${ACCOUNT2}`;
const KEY_NOTES_OWNER      = `portfolio:notepad_notes:${OWNER}`;
const KEY_NOTES_ACC2       = `portfolio:notepad_notes:${ACCOUNT2}`;
const KEY_ARTIFACTS_GLOBAL = "portfolio:artifacts";
const KEY_NOTES_GLOBAL     = "portfolio:notepad_notes";

const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  connectionLimit: 1,
});

async function getRows(key) {
  const [rows] = await pool.execute("SELECT `value` FROM kv_store WHERE `key` = ?", [key]);
  return rows.length > 0 ? JSON.parse(rows[0].value) : [];
}

async function setRows(key, data) {
  await pool.execute(
    "INSERT INTO kv_store (`key`, `value`, `owner_email`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `value` = ?, `owner_email` = ?",
    [key, JSON.stringify(data), OWNER, JSON.stringify(data), OWNER]
  );
}

async function deleteKey(key) {
  const [res] = await pool.execute("DELETE FROM kv_store WHERE `key` = ?", [key]);
  return res.affectedRows;
}

console.log("═".repeat(60));
console.log("  TiDB Merge & Cleanup");
console.log("═".repeat(60));

// ── STEP 1: Merge artifacts ───────────────────────────────────
const ownerArtifacts = await getRows(KEY_ARTIFACTS_OWNER);
const acc2Artifacts  = await getRows(KEY_ARTIFACTS_ACC2);

const ownerIds = new Set(ownerArtifacts.map(a => a.id));
const uniqueFromAcc2 = acc2Artifacts.filter(a => !ownerIds.has(a.id));

console.log(`\n[Artifacts]`);
console.log(`  trungnc:  ${ownerArtifacts.length} items`);
console.log(`  account2: ${acc2Artifacts.length} items`);
console.log(`  Unique only in account2 (will merge): ${uniqueFromAcc2.length} items`);

if (uniqueFromAcc2.length > 0) {
  const merged = [...ownerArtifacts, ...uniqueFromAcc2];
  await setRows(KEY_ARTIFACTS_OWNER, merged);
  console.log(`  ✅ Merged → trungnc now has ${merged.length} artifacts`);
} else {
  console.log(`  ✅ No unique items to merge (account2 only has subset of trungnc's data)`);
}

// ── STEP 2: Merge notepad notes ───────────────────────────────
const ownerNotes = await getRows(KEY_NOTES_OWNER);
const acc2Notes  = await getRows(KEY_NOTES_ACC2);

const ownerNoteIds = new Set(ownerNotes.map(n => n.id));
const uniqueNotesFromAcc2 = acc2Notes.filter(n => !ownerNoteIds.has(n.id));

console.log(`\n[Notepad Notes]`);
console.log(`  trungnc:  ${ownerNotes.length} notes`);
console.log(`  account2: ${acc2Notes.length} notes`);
console.log(`  Unique only in account2: ${uniqueNotesFromAcc2.length} notes`);

if (uniqueNotesFromAcc2.length > 0) {
  const merged = [...ownerNotes, ...uniqueNotesFromAcc2];
  await setRows(KEY_NOTES_OWNER, merged);
  console.log(`  ✅ Merged → trungnc now has ${merged.length} notes`);
} else {
  console.log(`  ✅ account2 notes are defaults only — nothing to merge`);
}

// ── STEP 3: Delete account2 keys ─────────────────────────────
console.log(`\n[Cleanup]`);
let deleted = 0;
deleted += await deleteKey(KEY_ARTIFACTS_ACC2);
deleted += await deleteKey(KEY_NOTES_ACC2);
deleted += await deleteKey(KEY_ARTIFACTS_GLOBAL);
deleted += await deleteKey(KEY_NOTES_GLOBAL);
console.log(`  ✅ Deleted ${deleted} old/account2 rows`);

// ── Final state ───────────────────────────────────────────────
const [remaining] = await pool.execute(
  "SELECT `key`, `owner_email`, JSON_LENGTH(`value`) AS cnt FROM kv_store ORDER BY `key`"
);
console.log(`\n📋 Final state of kv_store:`);
console.table(remaining);

await pool.end();
console.log("\n🎉 Done!");
