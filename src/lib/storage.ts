/**
 * localStorage utilities for managing storage quota and photo data
 */

// Constants
const STORAGE_KEY = 'countdown-photos';
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage

export interface PhotoData {
  photos: string[];
  uploadedAt: number;
}

export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
  isNearLimit: boolean;
}

/**
 * Estimates the total localStorage size limit
 * Most browsers have ~5-10MB, we'll assume 5MB to be safe
 */
function getEstimatedStorageLimit(): number {
  return 5 * 1024 * 1024; // 5MB in bytes
}

/**
 * Calculates the current localStorage usage
 */
export function getStorageUsage(): StorageInfo {
  let used = 0;

  try {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length * 2; // UTF-16 encoding (2 bytes per char)
        }
      }
    }
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }

  const total = getEstimatedStorageLimit();
  const percentage = (used / total) * 100;

  return {
    used,
    total,
    percentage,
    isNearLimit: percentage >= WARNING_THRESHOLD * 100,
  };
}

/**
 * Formats bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if there's enough space to store additional data
 * @param additionalBytes - Size of data to add in bytes
 */
export function hasEnoughSpace(additionalBytes: number): boolean {
  const { used, total } = getStorageUsage();
  return used + additionalBytes < total * 0.95; // Leave 5% buffer
}

/**
 * Saves photos to localStorage
 */
export function savePhotos(photos: string[]): boolean {
  try {
    const data: PhotoData = {
      photos,
      uploadedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving photos to localStorage:', error);

    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }

    return false;
  }
}

/**
 * Loads photos from localStorage
 */
export function loadPhotos(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed: PhotoData = JSON.parse(data);
    return parsed.photos || [];
  } catch (error) {
    console.error('Error loading photos from localStorage:', error);
    return [];
  }
}

/**
 * Clears all photos from localStorage
 */
export function clearPhotos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing photos:', error);
  }
}

/**
 * Removes a photo at a specific index
 */
export function removePhoto(index: number): string[] {
  const photos = loadPhotos();

  if (index >= 0 && index < photos.length) {
    photos.splice(index, 1);
    savePhotos(photos);
  }

  return photos;
}

/**
 * Adds new photos to existing photos
 * @param newPhotos - Array of base64 strings to add
 * @param maxPhotos - Maximum number of photos allowed
 */
export function addPhotos(newPhotos: string[], maxPhotos: number = 10): string[] {
  const existing = loadPhotos();
  const combined = [...existing, ...newPhotos].slice(0, maxPhotos);

  savePhotos(combined);
  return combined;
}

