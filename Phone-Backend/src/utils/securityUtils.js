const path = require('path');
const fs = require('fs');

/**
 * Sanitize and validate file path to prevent path traversal attacks
 * @param {string} userInput - User provided filename or path
 * @param {string} baseDir - Base directory to restrict access
 * @returns {string|null} - Sanitized absolute path or null if invalid
 */
exports.sanitizeFilePath = (userInput, baseDir) => {
  if (!userInput || typeof userInput !== 'string') {
    return null;
  }

  // Remove any directory traversal patterns
  const filename = path.basename(userInput);
  
  // Check for suspicious patterns
  if (filename.includes('..') || 
      filename.includes('/') || 
      filename.includes('\\') ||
      filename.startsWith('.') ||
      filename.length === 0) {
    return null;
  }

  // Construct absolute path
  const absolutePath = path.resolve(baseDir, filename);
  
  // Verify the path is within the base directory
  const absoluteBaseDir = path.resolve(baseDir);
  if (!absolutePath.startsWith(absoluteBaseDir + path.sep)) {
    return null;
  }

  return absolutePath;
};

/**
 * Safely delete file with path validation
 * @param {string} filePath - Path to file to delete
 * @param {string} baseDir - Base directory to restrict access
 * @returns {boolean} - True if deleted successfully, false otherwise
 */
exports.safeDeleteFile = (filePath, baseDir) => {
  try {
    const sanitizedPath = exports.sanitizeFilePath(filePath, baseDir);
    
    if (!sanitizedPath) {
      return false;
    }

    // Check if file exists
    if (!fs.existsSync(sanitizedPath)) {
      return false;
    }

    // Verify it's a file, not a directory
    const stats = fs.statSync(sanitizedPath);
    if (!stats.isFile()) {
      return false;
    }

    // Delete the file
    fs.unlinkSync(sanitizedPath);
    return true;
  } catch (error) {
    console.error('Error in safeDeleteFile:', error);
    return false;
  }
};

/**
 * Safely read file with path validation
 * @param {string} filePath - Path to file to read
 * @param {string} baseDir - Base directory to restrict access
 * @returns {Buffer|null} - File content or null if invalid
 */
exports.safeReadFile = (filePath, baseDir) => {
  try {
    const sanitizedPath = exports.sanitizeFilePath(filePath, baseDir);
    
    if (!sanitizedPath) {
      return null;
    }

    // Atomic check and read - avoid TOCTOU race condition
    // Use single operation instead of existsSync -> statSync -> readFileSync
    let stats;
    try {
      stats = fs.statSync(sanitizedPath);
    } catch (err) {
      // File doesn't exist or permission error
      return null;
    }

    // Verify it's a file, not a directory
    if (!stats.isFile()) {
      return null;
    }

    // Read the file
    return fs.readFileSync(sanitizedPath);
  } catch (error) {
    console.error('Error in safeReadFile:', error);
    return null;
  }
};

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
exports.sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate that a path is within allowed directory
 * @param {string} filePath - Path to validate
 * @param {string} allowedDir - Allowed base directory
 * @returns {boolean} - True if path is safe
 */
exports.isPathSafe = (filePath, allowedDir) => {
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(allowedDir);
  
  return resolvedPath.startsWith(resolvedBase + path.sep) || 
         resolvedPath === resolvedBase;
};

/**
 * Validate URL is from trusted domain (prevent open redirect)
 * @param {string} url - URL to validate
 * @param {array} trustedDomains - List of trusted domains
 * @returns {boolean} - True if URL is safe
 */
exports.isUrlSafe = (url, trustedDomains = []) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    // Check if domain is in trusted list
    const isTrusted = trustedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
    
    return isTrusted;
  } catch (error) {
    // Invalid URL
    return false;
  }
};
