/**
 * Check which claude.ai artifact URLs are still alive
 * Run: node scripts/check-artifact-urls.mjs
 */

const ARTIFACTS = [
  { id: "developer-portfolio",  url: "https://claude.ai/public/artifacts/91b72624-43a1-44b2-8351-96e345aac649" },
  { id: "vietnam-cv-optimizer", url: "https://claude.ai/public/artifacts/c174a083-63d1-48f7-aaca-8c293e4a810e" },
  { id: "it-market-insights",   url: "https://claude.ai/public/artifacts/b6bc0fc2-110c-4a07-bd12-785ac058b0f3" },
  { id: "free-llm-ranker",      url: "https://claude.ai/public/artifacts/2adc7758-6eea-44ee-b669-d9f167a99006" },
  { id: "rsi-intelligence-hub", url: "https://claude.ai/public/artifacts/29896560-2047-43ec-ab34-e8d3e86d6a7b" },
  { id: "vn-stock-prompts",     url: "https://claude.ai/public/artifacts/7319a629-9844-4427-bf42-dab50f585de5" },
  { id: "shopee-spending",      url: "https://claude.ai/public/artifacts/8b1c961d-5bb2-4f87-88a6-98de54667a47" },
  { id: "english-deep-learning",url: "https://claude.ai/public/artifacts/b7889082-bc1d-4a01-aa2d-db9920a294b5" },
  // Custom ones (from Redis backup)
  { id: "custom-phan-xa-tieng-anh", url: "https://claude.ai/public/artifacts/8bbdf4a6-e697-484c-aa85-638a50908213" },
  { id: "custom-chunk-lab",     url: "https://claude.ai/public/artifacts/25c9c286-7088-43cd-8bef-80a431267517" },
];

console.log("🔍 Checking artifact URLs...\n");

const results = [];
for (const art of ARTIFACTS) {
  try {
    const res = await fetch(art.url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const alive = res.status < 400;
    const status = `${res.status} ${res.statusText}`;
    results.push({ id: art.id, status, alive });
    console.log(`${alive ? "✅" : "❌"} [${res.status}] ${art.id}`);
  } catch (err) {
    results.push({ id: art.id, status: `ERROR: ${err.message}`, alive: false });
    console.log(`❌ [ERR] ${art.id}: ${err.message}`);
  }
}

console.log("\n📋 Summary:");
console.table(results);

const dead = results.filter(r => !r.alive);
if (dead.length > 0) {
  console.log("\n⚠️  Dead links to comment out:");
  dead.forEach(d => console.log(`   - ${d.id}`));
} else {
  console.log("\n✅ All links alive!");
}
