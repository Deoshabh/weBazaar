const Review = require('../models/Review');
const Product = require('../models/Product');
// const { Queue } = require('bullmq'); // Removed in favor of simple redis list
const Minio = require('minio');
const crypto = require('crypto');
const path = require('path');

// Initialize MinIO Client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'radeo-reviews';

// Ensure bucket exists
(async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created.`);
      
      // Set public policy for read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (err) {
    console.error('MinIO Bucket Error:', err);
  }
})();

// Initialize Redis Client for Queue (using ioredis)
const Redis = require('ioredis');
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Helper: Upload to MinIO
const uploadToMinio = async (file) => {
  const fileExt = path.extname(file.originalname);
  const fileName = `${crypto.randomUUID()}${fileExt}`;
  
  await minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, {
    'Content-Type': file.mimetype
  });

  return {
    url: `/api/v1/storage/${BUCKET_NAME}/${fileName}`,
    publicId: fileName
  };
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // 1. Validation
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 2. Handle Image Uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToMinio(file);
        images.push(uploadResult);
      }
    }

    // 3. Create Review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      images,
      status: 'pending'
    });

    // 4. Dispatch Moderation Jobs if images exist
    if (images.length > 0) {
      for (const image of images) {
        // Push to simple Redis list queue
        const jobData = JSON.stringify({
          reviewId: review._id.toString(),
          imageId: image.publicId,
          bucketName: BUCKET_NAME
        });
        
        await redisClient.rpush('queue:image-moderation', jobData);
      }
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });

  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

// ... other controller methods (getReviews, etc.) can be added here
