const Redis = require("ioredis");

// Track auth failures so we don't spam logs or retry endlessly
let authFailed = false;
let connectLoggedOnce = false;

const AUTH_ERRORS = ["WRONGPASS", "NOAUTH", "invalid username-password", "user is disabled"];

const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || process.env.VALKEY_PASSWORD || undefined,
    username: process.env.REDIS_USERNAME || undefined,
    retryStrategy: (times) => {
      // Never retry after an auth failure — wrong password won't fix itself
      if (authFailed) return null;
      // Stop after 10 connection attempts for network errors
      if (times > 10) {
        console.warn("⚠️  Redis: gave up after 10 reconnect attempts. Caching disabled.");
        return null;
      }
      // Exponential back-off: 500ms → 5s
      return Math.min(times * 500, 5000);
    },
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    enableOfflineQueue: false, // don't queue up commands while disconnected
    lazyConnect: true,
  };
};

const redis = new Redis(getRedisConfig());

redis.on("connect", () => {
  if (!connectLoggedOnce) {
    console.log("✅ Connected to Valkey/Redis");
    connectLoggedOnce = true;
  }
});

redis.on("ready", () => {
  connectLoggedOnce = true;
});

redis.on("error", (err) => {
  // Suppress all logs after an auth failure is already reported
  if (authFailed) return;

  const isAuthError = AUTH_ERRORS.some((s) => err.message && err.message.includes(s));
  if (isAuthError) {
    authFailed = true;
    console.error("❌ Redis auth failed:", err.message);
    console.warn(
      "⚠️  Fix REDIS_PASSWORD (or REDIS_USERNAME/REDIS_URL) in your env and redeploy."
    );
    console.warn("⚠️  Caching is disabled until the credential is corrected.");
    // Disconnect immediately — retryStrategy will return null and stop the loop
    redis.disconnect();
    return;
  }

  console.error("❌ Redis Connection Error:", err.message);
  console.warn("⚠️  Redis is unavailable. App will continue without caching.");
});

redis.on("reconnecting", () => {
  if (!authFailed) console.log("🔄 Attempting to reconnect to Redis...");
});

redis.on("close", () => {
  connectLoggedOnce = false;
});

module.exports = redis;
