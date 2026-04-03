/**
 * Language Detection Utilities
 * 
 * Detects Hindi (Devanagari script) in text input
 */

/**
 * Devanagari Unicode range: U+0900 to U+097F
 */
const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;

/**
 * Detect if text contains Hindi (Devanagari script)
 * 
 * @param text - Text to analyze
 * @param threshold - Percentage threshold (default: 0.2 = 20%)
 * @returns True if Hindi detected above threshold
 */
export function detectHindi(text: string, threshold: number = 0.2): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Count Devanagari characters
  const devanagariMatches = text.match(DEVANAGARI_REGEX);
  const devanagariCount = devanagariMatches ? devanagariMatches.length : 0;

  // Count total characters (excluding whitespace)
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) {
    return false;
  }

  // Calculate percentage
  const percentage = devanagariCount / totalChars;

  return percentage >= threshold;
}

/**
 * Get language from text
 * 
 * @param text - Text to analyze
 * @returns 'hi' for Hindi, 'en' for English
 */
export function getLanguage(text: string): 'hi' | 'en' {
  return detectHindi(text) ? 'hi' : 'en';
}

/**
 * Count Devanagari characters in text
 * 
 * @param text - Text to analyze
 * @returns Count of Devanagari characters
 */
export function countDevanagari(text: string): number {
  const matches = text.match(DEVANAGARI_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Get percentage of Hindi characters in text
 * 
 * @param text - Text to analyze
 * @returns Percentage (0-1)
 */
export function getHindiPercentage(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const devanagariCount = countDevanagari(text);
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) {
    return 0;
  }

  return devanagariCount / totalChars;
}
