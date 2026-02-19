const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { invalidateCache } = require("../utils/cache");
const { log } = require("../utils/logger");

/**
 * Abandoned Razorpay Order Cleanup Service
 *
 * Cancels orders where:
 *  - payment.method === "razorpay"
 *  - payment.status === "pending"
 *  - createdAt > TIMEOUT_MINUTES ago
 *
 * Stock is restored atomically within a transaction.
 */
const TIMEOUT_MINUTES = parseInt(process.env.RAZORPAY_TIMEOUT_MINUTES, 10) || 30;

async function cleanupAbandonedOrders() {
  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

  const abandonedOrders = await Order.find({
    "payment.method": "razorpay",
    "payment.status": "pending",
    status: { $in: ["confirmed", "pending_payment"] },
    createdAt: { $lt: cutoff },
  });

  if (abandonedOrders.length === 0) return { cleaned: 0 };

  let cleaned = 0;

  for (const order of abandonedOrders) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Restore stock for each item
        for (const item of order.items) {
          if (item.product && item.size && item.quantity) {
            await Product.updateOne(
              { _id: item.product, "sizes.size": item.size },
              {
                $inc: {
                  "sizes.$.stock": item.quantity,
                  stock: item.quantity,
                },
              },
              { session },
            );
          }
        }

        // Mark the order as cancelled
        order.status = "cancelled";
        order.payment.status = "failed";
        await order.save({ session });
      });

      cleaned++;
    } catch (err) {
      log.error("Failed to clean abandoned order", { orderId: order.orderId, error: err.message });
    } finally {
      session.endSession();
    }
  }

  if (cleaned > 0) {
    await invalidateCache("products:*");
    log.info("Cleaned abandoned Razorpay orders", { cleaned });
  }

  return { cleaned, total: abandonedOrders.length };
}

/**
 * Start the periodic cleanup on a configurable interval (default: every 5 min).
 */
let intervalHandle = null;

function startCleanupScheduler() {
  const intervalMs = (parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 5) * 60 * 1000;

  // Run once immediately, then schedule
  cleanupAbandonedOrders().catch((err) =>
    log.error("Initial abandoned order cleanup failed", err),
  );

  intervalHandle = setInterval(() => {
    cleanupAbandonedOrders().catch((err) =>
      log.error("Abandoned order cleanup failed", err),
    );
  }, intervalMs);

  log.info("Abandoned order cleanup scheduled", { intervalMinutes: intervalMs / 60000 });
}

function stopCleanupScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = {
  cleanupAbandonedOrders,
  startCleanupScheduler,
  stopCleanupScheduler,
};
