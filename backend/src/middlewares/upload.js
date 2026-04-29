const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { s3, S3_BUCKET } = require('../config/s3');
const logger = require('../utils/logger');

// Use memory storage for S3 upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3
  }
});

/**
 * Upload file to S3 and return the URL
 */
const uploadToS3 = async (file, folder = 'images') => {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${uuidv4()}${ext}`;

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private'
  };

  try {
    await s3.upload(params).promise();
    const cdnDomain = process.env.CLOUDFRONT_DOMAIN;
    return cdnDomain ? `${cdnDomain}/${key}` : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  } catch (err) {
    logger.error('S3 upload error:', err.message);
    throw err;
  }
};

module.exports = { upload, uploadToS3 };
