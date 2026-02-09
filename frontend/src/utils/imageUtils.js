/**
 * Image Compression and Optimization Utility
 * Automatically compresses and optimizes images before upload
 */

/**
 * Compress an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 0.9,
    outputFormat = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".jpg"),
                { type: outputFormat },
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Compression failed"));
            }
          },
          outputFormat,
          quality,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert image to square with padding (no cropping)
 * @param {File} file - The image file
 * @param {number} size - Target size for square
 * @param {string} backgroundColor - Background color for padding
 * @returns {Promise<File>}
 */
export const convertToSquare = (
  file,
  size = 1200,
  backgroundColor = "#FFFFFF",
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Calculate scaling to fit image within square
        const scale = Math.min(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center image
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const squareFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, "_square.jpg"),
                { type: "image/jpeg" },
              );
              resolve(squareFile);
            } else {
              reject(new Error("Failed to create square image"));
            }
          },
          "image/jpeg",
          0.95,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Get image dimensions without loading the full file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        });
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - The image file
 * @param {Object} options - Validation options
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateImage = async (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    minWidth = 500,
    minHeight = 500,
    maxWidth = 5000,
    maxHeight = 5000,
    allowedFormats = ["image/jpeg", "image/png", "image/webp"],
  } = options;

  // Check file type
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid format. Allowed: ${allowedFormats.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  try {
    // Check dimensions
    const { width, height } = await getImageDimensions(file);

    if (width < minWidth || height < minHeight) {
      return {
        valid: false,
        error: `Image too small. Minimum: ${minWidth}x${minHeight}px`,
      };
    }

    if (width > maxWidth || height > maxHeight) {
      return {
        valid: false,
        error: `Image too large. Maximum: ${maxWidth}x${maxHeight}px`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to validate image",
    };
  }
};

/**
 * Batch process multiple images
 * @param {File[]} files - Array of image files
 * @param {Function} processor - Processing function
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<File[]>}
 */
export const batchProcessImages = async (files, processor, onProgress) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const processed = await processor(files[i]);
      results.push(processed);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          percentage: ((i + 1) / files.length) * 100,
        });
      }
    } catch (error) {
      console.error(`Failed to process image ${i + 1}:`, error);
      results.push(files[i]); // Use original on failure
    }
  }

  return results;
};

/**
 * Auto-optimize image for web display
 * @param {File} file - The image file
 * @returns {Promise<File>}
 */
export const autoOptimize = async (file) => {
  const { width, height } = await getImageDimensions(file);

  // Determine optimal settings based on image size
  let maxWidth = 2000;
  let quality = 0.9;

  if (width > 3000 || height > 3000) {
    maxWidth = 2000;
    quality = 0.85;
  } else if (width > 2000 || height > 2000) {
    maxWidth = 1500;
    quality = 0.9;
  } else {
    maxWidth = width; // Keep original size if already small
    quality = 0.95;
  }

  return compressImage(file, {
    maxWidth,
    maxHeight: maxWidth,
    quality,
  });
};
