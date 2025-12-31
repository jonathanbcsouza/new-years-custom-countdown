/**
 * Image compression utilities using Canvas API
 * Compresses images for localStorage storage with optimal quality/size balance
 */

// Constants for image compression
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 0.75;
const MAX_FILE_SIZE_KB = 400; // Target max size per image in KB

export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

/**
 * Loads an image file and returns an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let newWidth = width;
  let newHeight = height;

  // Scale down if exceeds max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Compresses an image file using Canvas API
 * @param file - The image file to compress
 * @returns Promise with compression result containing base64 string
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Load the image
  const img = await loadImage(file);

  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    MAX_WIDTH,
    MAX_HEIGHT
  );

  // Create canvas and draw image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image with high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Try to compress to target size
  let quality = JPEG_QUALITY;
  let base64 = canvas.toDataURL('image/jpeg', quality);
  let compressedSize = Math.round((base64.length * 3) / 4); // Approximate size in bytes

  // Reduce quality if still too large
  while (compressedSize > MAX_FILE_SIZE_KB * 1024 && quality > 0.3) {
    quality -= 0.1;
    base64 = canvas.toDataURL('image/jpeg', quality);
    compressedSize = Math.round((base64.length * 3) / 4);
  }

  return {
    base64,
    originalSize,
    compressedSize,
    width,
    height,
  };
}

/**
 * Validates if a file is an acceptable image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Compresses multiple images and returns results
 * @param files - Array of image files
 * @param onProgress - Optional callback for progress updates
 * @returns Promise with array of base64 strings
 */
export async function compressImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!isValidImageType(file)) {
      console.warn(`Skipping invalid file type: ${file.type}`);
      continue;
    }

    try {
      const result = await compressImage(file);
      results.push(result.base64);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
    }
  }

  return results;
}

