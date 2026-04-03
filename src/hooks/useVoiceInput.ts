/**
 * useVoiceInput Hook
 * 
 * Manages Web Speech API for voice recognition with Hindi/English support
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// Check if browser supports Web Speech API
const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

// Get SpeechRecognition constructor
const getSpeechRecognition = (): typeof SpeechRecognition | null => {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export type VoiceLanguage = 'hi' | 'en'
export type RecognitionState = 'idle' | 'listening' | 'processing' | 'error'

interface UseVoiceInputOptions {
  language?: VoiceLanguage
  continuous?: boolean
  interimResults?: boolean
  onTranscript?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

interface UseVoiceInputReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  state: RecognitionState
  startListening: () => void
  stopListening: () => void
  cancelListening: () => void
  setLanguage: (lang: VoiceLanguage) => void
  language: VoiceLanguage
}

export function useVoiceInput({
  language: initialLanguage = 'en',
  continuous = true,
  interimResults = true,
  onTranscript,
  onError,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isSupported] = useState(isSpeechRecognitionSupported())
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<RecognitionState>('idle')
  const [language, setLanguage] = useState<VoiceLanguage>(initialLanguage)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = 1

    // Set language based on selection
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          finalText += text + ' '
        } else {
          interimText += text
        }
      }

      if (finalText) {
        finalTranscriptRef.current += finalText
        setTranscript(finalTranscriptRef.current.trim())
        onTranscript?.(finalTranscriptRef.current.trim(), true)
      }

      if (interimText) {
        setInterimTranscript(interimText)
        onTranscript?.(interimText, false)
      }
    }

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      
      let errorMessage = 'An error occurred during voice recognition'
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone not found or not working'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        case 'aborted':
          // User cancelled, not really an error
          errorMessage = ''
          break
      }

      if (errorMessage) {
        setError(errorMessage)
        setState('error')
        onError?.(errorMessage)
      }
      
      setIsListening(false)
    }

    // Handle end
    recognition.onend = () => {
      setIsListening(false)
      if (state === 'listening') {
        setState('idle')
      }
    }

    // Handle start
    recognition.onstart = () => {
      setIsListening(true)
      setState('listening')
      setError(null)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported, continuous, interimResults, language, onTranscript, onError, state])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    try {
      // Reset transcripts
      finalTranscriptRef.current = ''
      setTranscript('')
      setInterimTranscript('')
      setError(null)
      
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting recognition:', err)
      setError('Failed to start voice recognition')
    }
  }, [isSupported])

  // Stop listening (keeps transcript)
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  // Cancel listening (clears transcript)
  const cancelListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort()
      finalTranscriptRef.current = ''
      setTranscript('')
      setInterimTranscript('')
      setState('idle')
    }
  }, [isListening])

  // Update language
  const handleSetLanguage = useCallback((lang: VoiceLanguage) => {
    setLanguage(lang)
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    }
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    state,
    startListening,
    stopListening,
    cancelListening,
    setLanguage: handleSetLanguage,
    language,
  }
}
