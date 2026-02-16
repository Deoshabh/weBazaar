const SecurityEvent = require("../models/SecurityEvent");
const { log } = require("./logger");

const recordSecurityEvent = async ({
  eventType,
  actorUserId = null,
  targetUserId = null,
  reason = "",
  ip = null,
  userAgent = null,
  metadata = {},
}) => {
  if (!eventType) {
    return;
  }

  try {
    await SecurityEvent.create({
      eventType,
      actorUserId,
      targetUserId,
      reason,
      ip,
      userAgent,
      metadata,
    });
  } catch (error) {
    log.warn("Failed to persist security event", {
      eventType,
      reason,
      error: error.message,
    });
  }
};

module.exports = {
  recordSecurityEvent,
};
