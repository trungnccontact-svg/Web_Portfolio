// import Redis from "ioredis";
// 
// // Singleton pattern: reuse connection across hot-reloads in dev
// const globalForRedis = globalThis as unknown as { redis: Redis | undefined };
// 
// function createRedisClient(): Redis {
//   const url = process.env.REDIS_URL;
//   if (!url) {
//     throw new Error("REDIS_URL environment variable is not set.");
//   }
// 
//   const client = new Redis(url, {
//     // Serverless-friendly settings
//     maxRetriesPerRequest: 3,
//     lazyConnect: false,
//     // TLS is required for remote Redis (Upstash/Vercel KV)
//     tls: url.startsWith("rediss://") ? {} : undefined,
//   });
// 
//   client.on("error", (err) => {
//     console.error("[Redis] Connection error:", err);
//   });
// 
//   return client;
// }
// 
// export const redis: Redis =
//   globalForRedis.redis ?? (globalForRedis.redis = createRedisClient());

