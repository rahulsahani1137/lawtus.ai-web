/**
 * VoiceInput Component
 * 
 * Microphone button with live transcript display for Hindi/English voice input
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, MicOff, X, Languages } from 'lucide-react'
import { useVoiceInput, type VoiceLanguage } from '@/hooks/useVoiceInput'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  /** Current language for recognition */
  language?: VoiceLanguage
  /** Callback when transcript is updated */
  onTranscript?: (transcript: string) => void
  /** Callback when language changes */
  onLanguageChange?: (language: VoiceLanguage) => void
  /** Optional class name */
  className?: string
  /** Show language selector */
  showLanguageSelector?: boolean
}

export function VoiceInput({
  language: externalLanguage,
  onTranscript,
  onLanguageChange,
  className,
  showLanguageSelector = true,
}: VoiceInputProps) {
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    cancelListening,
    setLanguage,
    language,
  } = useVoiceInput({
    language: externalLanguage,
    continuous: true,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        onTranscript?.(text)
      }
    },
  })

  // Sync external language changes
  useEffect(() => {
    if (externalLanguage && externalLanguage !== language) {
      setLanguage(externalLanguage)
    }
  }, [externalLanguage, language, setLanguage])

  // Handle language toggle
  const handleLanguageToggle = () => {
    const newLanguage: VoiceLanguage = language === 'hi' ? 'en' : 'hi'
    setLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
  }

  // Handle start/stop recording
  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Handle cancel
  const handleCancel = () => {
    cancelListening()
  }

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Microphone button */}
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'outline'}
          size="icon-sm"
          onClick={handleToggleRecording}
          title={isListening ? 'Stop recording' : 'Start voice input'}
          className={cn(
            'transition-all',
            isListening && 'animate-pulse'
          )}
        >
          {isListening ? (
            <MicOff className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </Button>

        {/* Language selector */}
        {showLanguageSelector && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            disabled={isListening}
            title={`Switch to ${language === 'hi' ? 'English' : 'Hindi'}`}
          >
            <Languages className="size-4" />
            <span className="text-xs">
              {language === 'hi' ? 'हिंदी' : 'English'}
            </span>
          </Button>
        )}

        {/* Cancel button (only when listening) */}
        {isListening && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCancel}
            title="Cancel recording"
          >
            <X className="size-4" />
          </Button>
        )}

        {/* Recording indicator */}
        {isListening && (
          <Badge variant="destructive" className="gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            <span>Recording...</span>
          </Badge>
        )}
      </div>

      {/* Live transcript */}
      {isListening && (interimTranscript || transcript) && (
        <div className="rounded-md border bg-muted/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="size-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-muted-foreground">
              Listening...
            </span>
          </div>
          
          <div className="text-sm">
            {transcript && (
              <span className="text-foreground">{transcript} </span>
            )}
            {interimTranscript && (
              <span className="text-muted-foreground italic">
                {interimTranscript}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
