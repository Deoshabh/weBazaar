const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        api: "operational",
        database: "checking",
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024,
          )}MB`,
        },
      },
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.database = "operational";

      // Ping database
      await mongoose.connection.db.admin().ping();
    } else {
      healthCheck.services.database = "disconnected";
      healthCheck.status = "DEGRADED";
    }

    // Determine overall status
    const statusCode = healthCheck.status === "OK" ? 200 : 503;

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        api: "operational",
        database: "error",
      },
    });
  }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for Kubernetes/Docker
 * @access  Public
 */
router.get("/ready", async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "NOT_READY",
        message: "Database not connected",
      });
    }

    // Try to ping database
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "READY",
      message: "Service is ready to accept requests",
    });
  } catch (error) {
    res.status(503).json({
      status: "NOT_READY",
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for Kubernetes/Docker
 * @access  Public
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "ALIVE",
    message: "Service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
