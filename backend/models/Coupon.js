const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["flat", "percent"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          // For percent type, value must be <= 100
          if (this.type === 'percent' && v > 100) return false;
          return true;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },
    minOrder: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    expiry: {
      type: Date,
      required: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
