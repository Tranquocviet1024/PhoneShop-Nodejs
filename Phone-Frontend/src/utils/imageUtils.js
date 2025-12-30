/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Extract base URL (remove /api suffix)
const getBaseUrl = () => {
  const url = API_BASE_URL.replace(/\/api\/?$/, '');
  return url;
};

/**
 * Convert image URL to use the correct base URL
 * This handles cases where images were saved with localhost URLs in production
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The corrected image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  const baseUrl = getBaseUrl();
  
  // If it's a relative URL starting with /uploads, prepend the base URL
  if (imageUrl.startsWith('/uploads')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // If the URL contains localhost (any port), replace it with the current API base URL
  // This handles localhost:3000, localhost:5000, etc.
  if (imageUrl.includes('localhost')) {
    // Extract just the path part (/uploads/...)
    const uploadsMatch = imageUrl.match(/\/uploads\/[^?#]+/);
    if (uploadsMatch) {
      return `${baseUrl}${uploadsMatch[0]}`;
    }
  }
  
  // Return the original URL for other cases (external URLs, production URLs, etc.)
  return imageUrl;
};

/**
 * Get fallback image for when the image fails to load
 * @returns {string} - A data URI for a placeholder image
 */
export const getFallbackImage = () => {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
};

export default {
  getImageUrl,
  getFallbackImage,
};
