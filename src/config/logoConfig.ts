/**
 * Logo Configuration
 * Centralized configuration for logo paths and settings
 *
 * This file contains all logo-related configuration that can be easily customized
 * for different clients without modifying core application logic.
 */

// ============================================================================
// CLIENT CONFIGURATION - CUSTOMIZE THESE VALUES FOR EACH CLIENT
// ============================================================================

/**
 * Client-specific logo configuration
 *
 * To customize for a new client:
 * 1. Place the logo file in /public/images/logo/
 * 2. Update the LOGO_FILENAME below
 * 3. Optionally update LOGO_ALT_TEXT and COMPANY_NAME
 */
export const LOGO_CONFIG = {
  // Logo file name (place this file in /public/images/logo/)
  LOGO_FILENAME: 'qsalogo.png',

  // Logo alt text for accessibility
  LOGO_ALT_TEXT: 'Company Logo',

  // Company name (used in various places)
  COMPANY_NAME: 'QSA Solutions',

  // Logo dimensions (max width/height in pixels)
  MAX_WIDTH: 200,
  MAX_HEIGHT: 80,

  // Logo position options
  POSITION: 'left' as 'left' | 'center' | 'right'
} as const;

// ============================================================================
// PATH CONFIGURATION - DO NOT MODIFY UNLESS CHANGING FOLDER STRUCTURE
// ============================================================================

/**
 * Path configuration for logo assets
 * These paths are relative to the public directory
 */
export const LOGO_PATHS = {
  // Main logo folder
  LOGO_FOLDER: '/images/logo',

  // Full logo path (constructed from folder + filename)
  get FULL_LOGO_PATH() {
    return `${this.LOGO_FOLDER}/${LOGO_CONFIG.LOGO_FILENAME}`;
  },

  // Fallback logo options (for when main logo fails to load)
  FALLBACK_LOGOS: [
    '/images/contactless.png', // Bank/payment logo
    '/images/card (1).png',     // Alternative bank logo
    '/images/LIPA.png'          // Vodacom logo
  ]
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the full logo path for the current client configuration
 * @returns Full path to the logo file
 */
export function getLogoPath(): string {
  return LOGO_PATHS.FULL_LOGO_PATH;
}

/**
 * Get fallback logo paths in order of preference
 * @returns Array of fallback logo paths
 */
export function getFallbackLogoPaths(): string[] {
  return [...LOGO_PATHS.FALLBACK_LOGOS];
}

/**
 * Validate if a logo file exists at the configured path
 * Note: This is a client-side check and may not work in all environments
 * @returns Promise<boolean> indicating if logo exists
 */
export async function validateLogoExists(): Promise<boolean> {
  try {
    const response = await fetch(getLogoPath(), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get logo configuration for display components
 * @returns Object with logo display configuration
 */
export function getLogoDisplayConfig() {
  return {
    src: getLogoPath(),
    alt: LOGO_CONFIG.LOGO_ALT_TEXT,
    maxWidth: LOGO_CONFIG.MAX_WIDTH,
    maxHeight: LOGO_CONFIG.MAX_HEIGHT,
    position: LOGO_CONFIG.POSITION
  };
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Log current logo configuration for debugging
 */
export function logLogoConfig() {
  console.group('📁 Logo Configuration');
  console.log('Logo Path:', getLogoPath());
  console.log('Fallback Paths:', getFallbackLogoPaths());
  console.log('Config:', LOGO_CONFIG);
  console.groupEnd();
}

// Logo configuration is ready for use
