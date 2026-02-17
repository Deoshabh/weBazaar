const mongoose = require("mongoose");

const seoHistorySchema = new mongoose.Schema(
  {
    meta_title: String,
    meta_description: String,
    meta_keywords: [String],
    og_title: String,
    og_description: String,
    og_image: String,
    twitter_title: String,
    twitter_description: String,
    twitter_image: String,
    canonical_url: String,
    robots: String,
    schema_json: mongoose.Schema.Types.Mixed,
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changed_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const seoSettingSchema = new mongoose.Schema(
  {
    page_key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    page_label: {
      type: String,
      required: true,
      trim: true,
    },
    meta_title: {
      type: String,
      default: "",
      maxlength: 70,
    },
    meta_description: {
      type: String,
      default: "",
      maxlength: 160,
    },
    meta_keywords: {
      type: [String],
      default: [],
    },
    og_title: {
      type: String,
      default: "",
    },
    og_description: {
      type: String,
      default: "",
    },
    og_image: {
      type: String,
      default: "",
    },
    og_type: {
      type: String,
      default: "website",
    },
    twitter_title: {
      type: String,
      default: "",
    },
    twitter_description: {
      type: String,
      default: "",
    },
    twitter_image: {
      type: String,
      default: "",
    },
    canonical_url: {
      type: String,
      default: "",
    },
    robots: {
      type: String,
      default: "index, follow",
    },
    schema_json: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    history: {
      type: [seoHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Keep only last 10 history entries
seoSettingSchema.pre("save", function (next) {
  if (this.history && this.history.length > 10) {
    this.history = this.history.slice(-10);
  }
  next();
});

module.exports = mongoose.model("SeoSetting", seoSettingSchema);
