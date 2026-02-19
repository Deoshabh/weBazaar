// ===============================
// Shiprocket Webhook Security Middleware
// ===============================
const crypto = require("crypto");
const { log } = require("../utils/logger");

const safeCompare = (left, right) => {
  if (!left || !right) return false;

  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const normalizeIP = (ip) => String(ip || "").replace(/^::ffff:/, "");

/**
 * Shiprocket webhook IP whitelist
 * Update this list based on Shiprocket's official documentation
 */
const SHIPROCKET_IPS = [
  "13.234.161.44",
  "13.234.27.58",
  "13.234.251.9",
  "52.66.111.82",
  "13.235.80.206",
  "3.110.101.158",
  // Add more IPs as provided by Shiprocket
];

/**
 * Middleware: Verify request is from Shiprocket IP
 * Note: IP check is skipped if valid x-api-key token is provided
 */
const verifyShiprocketIP = (req, res, next) => {
  // Skip IP check in development mode
  if (process.env.NODE_ENV !== "production") {
    log.debug("Webhook: IP verification skipped (development mode)");
    return next();
  }

  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress;

  const normalizedClientIP = normalizeIP(clientIP);

  log.debug("Webhook request", { ip: normalizedClientIP });

  // Skip IP check if valid x-api-key token is provided
  const apiKey = req.headers["x-api-key"];
  if (safeCompare(apiKey, process.env.SHIPROCKET_WEBHOOK_TOKEN)) {
    return next();
  }

  // Verify IP is from Shiprocket
  if (!SHIPROCKET_IPS.includes(normalizedClientIP)) {
    log.warn("Webhook: Unauthorized IP", { ip: normalizedClientIP });
    return res.status(403).json({
      success: false,
      message: "Forbidden: Unauthorized IP address",
    });
  }

  next();
};

/**
 * Middleware: Verify Shiprocket HMAC signature
 * Shiprocket signs webhooks with X-Shiprocket-Signature header
 */
const verifyShiprocketSignature = (req, res, next) => {
  try {
    const signature = req.headers["x-shiprocket-signature"];
    const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;

    // If no secret configured, fall back to x-api-key verification
    if (!secret) {
      log.warn("SHIPROCKET_WEBHOOK_SECRET not configured");
      const apiKey = req.headers["x-api-key"];
      if (!safeCompare(apiKey, process.env.SHIPROCKET_WEBHOOK_TOKEN)) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid webhook token",
        });
      }
      return next();
    }

    // Verify HMAC signature if header present
    if (signature) {
      // Get raw body (must be captured before JSON parsing)
      const rawBody = req.rawBody || JSON.stringify(req.body);

      // Compute HMAC-SHA256
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (!safeCompare(signature, computedSignature)) {
        log.warn("Webhook: Invalid signature");
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid signature",
        });
      }
    }

    next();
  } catch (error) {
    log.error("Signature verification error", error);
    res.status(500).json({
      success: false,
      message: "Signature verification failed",
    });
  }
};

/**
 * Middleware: Capture raw body for signature verification
 * Must be used BEFORE express.json()
 */
const captureRawBody = (req, res, next) => {
  req.rawBody = "";
  req.on("data", (chunk) => {
    req.rawBody += chunk.toString();
  });
  next();
};

module.exports = {
  verifyShiprocketIP,
  verifyShiprocketSignature,
  captureRawBody,
  SHIPROCKET_IPS,
};
