const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

/**
 * HTTP Request Logger Configuration
 * Uses Morgan for HTTP request logging
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log files
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});

const errorLogStream = fs.createWriteStream(path.join(logsDir, "error.log"), {
  flags: "a",
});

// Custom token for response time in milliseconds
morgan.token("response-time-ms", (req, res) => {
  if (!req._startAt || !res._startAt) {
    return;
  }
  const ms =
    (res._startAt[0] - req._startAt[0]) * 1000 +
    (res._startAt[1] - req._startAt[1]) / 1000000;
  return ms.toFixed(2);
});

// Custom format for detailed logging
const detailedFormat =
  ":method :url :status :response-time-ms ms - :res[content-length] bytes - :remote-addr - :user-agent";

// Console logger for development (colorful)
const consoleLogger = morgan("dev");

// File logger for production (detailed)
const fileLogger = morgan(detailedFormat, {
  stream: accessLogStream,
});

// Error logger (only log 4xx and 5xx responses)
const errorLogger = morgan(detailedFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
});

// Combined logger
const logger = (req, res, next) => {
  // Skip OPTIONS requests to reduce noise
  if (req.method === "OPTIONS") {
    return next();
  }

  // Use different loggers based on environment
  if (process.env.NODE_ENV === "production") {
    fileLogger(req, res, () => {
      errorLogger(req, res, next);
    });
  } else {
    consoleLogger(req, res, next);
  }
};

/**
 * Custom logger for application events
 */
const log = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  INFO: ${message}`, data);
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ERROR: ${message}`, {
      error: error.message,
      stack: error.stack,
    });

    // Write to error log file
    const errorLog = `[${timestamp}] ERROR: ${message}\n${
      error.stack || error.message || ""
    }\n\n`;
    fs.appendFileSync(path.join(logsDir, "error.log"), errorLog);
  },

  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  WARN: ${message}`, data);
  },

  success: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`, data);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🐛 DEBUG: ${message}`, data);
    }
  },
};

module.exports = {
  logger,
  log,
};
