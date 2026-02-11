const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxLength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  images: [{
    url: String,
    publicId: String // MinIO path or ID
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Moderation Fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  moderation_flag: {
    type: Boolean,
    default: false,
    index: true
  },
  isHidden: { // Manual override to hide
    type: Boolean,
    default: false,
    index: true
  },
  ai_tags: {
    nsfw_score: Number, // 0.0 to 1.0 (NudeNet)
    contains_prohibited_objects: Boolean, // YOLO
    detected_objects: [String], // List of objects found
    duplicate_hash: String, // Perceptual hash
    is_duplicate: Boolean
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by product and status
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per product per user

module.exports = mongoose.model('Review', reviewSchema);
