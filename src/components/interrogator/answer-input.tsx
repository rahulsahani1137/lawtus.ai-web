/**
 * AnswerInput Component
 * Renders the appropriate input based on question type
 */

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { VoiceInput } from '@/components/voice/voice-input'
import type { QuestionType } from '@/types/cldi'
import type { VoiceLanguage } from '@/hooks/useVoiceInput'

interface AnswerInputProps {
  questionType: QuestionType
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
  onLanguageChange?: (language: 'hi' | 'en') => void
}

export function AnswerInput({
  questionType,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = true,
  onLanguageChange,
}: AnswerInputProps) {
  const [showError, setShowError] = useState(false)
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('en')

  const handleBlur = () => {
    if (required && !value.trim()) {
      setShowError(true)
    }
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    if (newValue.trim()) {
      setShowError(false)
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    // Append voice transcript to existing value
    const newValue = value ? `${value} ${transcript}` : transcript
    handleChange(newValue)
  }

  const handleVoiceLanguageChange = (lang: VoiceLanguage) => {
    setVoiceLanguage(lang)
    onLanguageChange?.(lang)
  }

  // Text input
  if (questionType === 'text') {
    return (
      <LanguageToggle value={value} onLanguageChange={onLanguageChange}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder || 'Enter your answer here...'}
              disabled={disabled}
              className="min-h-[120px] resize-none flex-1"
            />
            <VoiceInput
              language={voiceLanguage}
              onTranscript={handleVoiceTranscript}
              onLanguageChange={handleVoiceLanguageChange}
              showLanguageSelector={false}
            />
          </div>
          {(error || showError) && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error || 'This field is required'}</span>
            </div>
          )}
        </div>
      </LanguageToggle>
    )
  }

  // Date input
  if (questionType === 'date') {
    return (
      <div className="space-y-2">
        <Input
          type="date"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-full"
        />
        {(error || showError) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error || 'Please select a date'}</span>
          </div>
        )}
      </div>
    )
  }

  // Yes/No toggle
  if (questionType === 'yes_no') {
    return (
      <div className="space-y-2">
        <div className="flex gap-3">
          <Button
            type="button"
            variant={value === 'yes' ? 'default' : 'outline'}
            onClick={() => handleChange('yes')}
            disabled={disabled}
            className="flex-1"
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={value === 'no' ? 'default' : 'outline'}
            onClick={() => handleChange('no')}
            disabled={disabled}
            className="flex-1"
          >
            No
          </Button>
        </div>
        {(error || showError) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error || 'Please select an option'}</span>
          </div>
        )}
      </div>
    )
  }

  // Document reference
  if (questionType === 'document_reference') {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder || 'e.g., FIR No. 123/2024, Court Order dated 15-01-2024'}
          disabled={disabled}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Reference the document name, number, or date
        </p>
        {(error || showError) && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error || 'Please provide a document reference'}</span>
          </div>
        )}
      </div>
    )
  }

  return null
}
