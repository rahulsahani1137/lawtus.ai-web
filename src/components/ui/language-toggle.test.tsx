/**
 * LanguageToggle Component Tests
 * 
 * Tests the language detection and toggle functionality
 */

import { describe, it, expect } from 'vitest'
import { detectHindi, getHindiPercentage, getLanguage } from '@/lib/lang-detect'

describe('Language Detection Logic', () => {
  it('should detect Hindi when Devanagari characters exceed threshold', () => {
    const hindiText = 'मैं एक वकील हूं' // "I am a lawyer" in Hindi
    
    expect(detectHindi(hindiText, 0.2)).toBe(true)
    expect(getLanguage(hindiText)).toBe('hi')
  })

  it('should not detect Hindi when text is in English', () => {
    const englishText = 'I am a lawyer'
    
    expect(detectHindi(englishText, 0.2)).toBe(false)
    expect(getLanguage(englishText)).toBe('en')
  })

  it('should detect Hindi at 20% threshold', () => {
    // Mix of Hindi and English - approximately 20% Hindi
    const mixedText = 'Test मैं test test test' // 2 Hindi chars out of ~18 = ~11%
    const mixedText2 = 'मैं test' // 2 Hindi chars out of ~6 = ~33%
    
    expect(detectHindi(mixedText, 0.2)).toBe(false) // Below threshold
    expect(detectHindi(mixedText2, 0.2)).toBe(true) // Above threshold
  })

  it('should calculate Hindi percentage correctly', () => {
    const hindiText = 'मैं एक वकील हूं' // 100% Hindi
    const englishText = 'I am a lawyer' // 0% Hindi
    const mixedText = 'मैं am a lawyer' // ~25% Hindi (2 out of 8 non-space chars)
    
    expect(getHindiPercentage(hindiText)).toBeGreaterThan(0.9) // ~100%
    expect(getHindiPercentage(englishText)).toBe(0) // 0%
    expect(getHindiPercentage(mixedText)).toBeGreaterThan(0.2) // >20%
    expect(getHindiPercentage(mixedText)).toBeLessThan(0.3) // <30%
  })

  it('should handle empty strings', () => {
    expect(detectHindi('', 0.2)).toBe(false)
    expect(getHindiPercentage('')).toBe(0)
    expect(getLanguage('')).toBe('en')
  })

  it('should handle whitespace-only strings', () => {
    expect(detectHindi('   ', 0.2)).toBe(false)
    expect(getHindiPercentage('   ')).toBe(0)
  })

  it('should ignore whitespace in percentage calculation', () => {
    const hindiWithSpaces = 'मैं   एक   वकील   हूं'
    const hindiNoSpaces = 'मैंएकवकीलहूं'
    
    // Both should have similar percentages (100% Hindi)
    expect(getHindiPercentage(hindiWithSpaces)).toBeCloseTo(
      getHindiPercentage(hindiNoSpaces),
      1
    )
  })

  it('should detect mixed Hindi-English content correctly', () => {
    const mixedText = 'The FIR states: आरोपी ने चोरी की' // Mixed content
    
    const percentage = getHindiPercentage(mixedText)
    expect(percentage).toBeGreaterThan(0) // Has some Hindi
    expect(percentage).toBeLessThan(1) // Not all Hindi
  })

  it('should handle custom thresholds', () => {
    const mixedText = 'Test मैं test' // ~20% Hindi (2 out of 10 non-space chars)
    
    expect(detectHindi(mixedText, 0.1)).toBe(true) // 10% threshold - passes
    expect(detectHindi(mixedText, 0.2)).toBe(true) // 20% threshold - passes (at threshold)
    expect(detectHindi(mixedText, 0.5)).toBe(false) // 50% threshold - fails
  })
})
