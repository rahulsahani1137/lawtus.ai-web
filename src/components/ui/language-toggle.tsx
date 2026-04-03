/**
 * LanguageToggle Component
 * 
 * Wraps text inputs with automatic Hindi detection and language toggle functionality.
 * Shows a badge when Hindi is detected and allows manual language selection.
 */

'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import { detectHindi, getHindiPercentage } from '@/lib/lang-detect'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  /** The current input value to analyze */
  value: string
  /** Callback when language mode changes */
  onLanguageChange?: (language: 'hi' | 'en') => void
  /** Children (input components) to wrap */
  children: ReactNode
  /** Optional class name for the wrapper */
  className?: string
  /** Show manual toggle button */
  showToggle?: boolean
  /** Detection threshold (default: 0.2 = 20%) */
  threshold?: number
}

export function LanguageToggle({
  value,
  onLanguageChange,
  children,
  className,
  showToggle = true,
  threshold = 0.2,
}: LanguageToggleProps) {
  const [detectedLanguage, setDetectedLanguage] = useState<'hi' | 'en'>('en')
  const [manualLanguage, setManualLanguage] = useState<'hi' | 'en' | null>(null)
  const [hindiPercentage, setHindiPercentage] = useState(0)

  // Detect language in real-time
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setDetectedLanguage('en')
      setHindiPercentage(0)
      return
    }

    const isHindi = detectHindi(value, threshold)
    const percentage = getHindiPercentage(value)
    
    setDetectedLanguage(isHindi ? 'hi' : 'en')
    setHindiPercentage(percentage)

    // Notify parent of language change
    if (onLanguageChange && !manualLanguage) {
      onLanguageChange(isHindi ? 'hi' : 'en')
    }
  }, [value, threshold, onLanguageChange, manualLanguage])

  // Current effective language (manual override or detected)
  const currentLanguage = manualLanguage || detectedLanguage

  // Toggle language manually
  const handleToggle = () => {
    const newLanguage = currentLanguage === 'hi' ? 'en' : 'hi'
    setManualLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
  }

  // Show badge when Hindi is detected
  const showBadge = detectedLanguage === 'hi' && hindiPercentage >= threshold

  return (
    <div className={cn('space-y-2', className)}>
      {/* Language indicator and toggle */}
      {(showBadge || showToggle) && (
        <div className="flex items-center justify-between gap-2">
          {/* Hindi detected badge */}
          {showBadge && (
            <Badge variant="secondary" className="gap-1.5">
              <Languages className="size-3" />
              <span>
                Hindi detected ({Math.round(hindiPercentage * 100)}%) — will be translated
              </span>
            </Badge>
          )}

          {/* Manual language toggle */}
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="ml-auto"
              title={`Switch to ${currentLanguage === 'hi' ? 'English' : 'Hindi'} input`}
            >
              <Languages className="size-4" />
              <span className="text-xs">
                Input in {currentLanguage === 'hi' ? 'Hindi' : 'English'}
              </span>
            </Button>
          )}
        </div>
      )}

      {/* Input component */}
      {children}

      {/* Original Hindi text preservation note */}
      {currentLanguage === 'hi' && value && (
        <p className="text-xs text-muted-foreground">
          Original Hindi text will be preserved alongside the English translation
        </p>
      )}
    </div>
  )
}
