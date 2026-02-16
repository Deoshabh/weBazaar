const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    createdByIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ userId: 1, tokenId: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
