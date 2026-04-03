/**
 * @vitest-environment jsdom
 */

/**
 * useVoiceInput Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoiceInput } from './useVoiceInput'

// Mock Web Speech API
const mockRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  lang: 'en-IN',
  continuous: false,
  interimResults: false,
  maxAlternatives: 1,
  onresult: null,
  onerror: null,
  onend: null,
  onstart: null,
}

describe('useVoiceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock SpeechRecognition
    global.window = {
      webkitSpeechRecognition: vi.fn(() => mockRecognition),
    } as any
  })

  it('detects browser support', () => {
    const { result } = renderHook(() => useVoiceInput())
    
    expect(result.current.isSupported).toBe(true)
  })

  it('initializes with default language', () => {
    const { result } = renderHook(() => useVoiceInput())
    
    expect(result.current.language).toBe('en')
  })

  it('initializes with custom language', () => {
    const { result } = renderHook(() => useVoiceInput({ language: 'hi' }))
    
    expect(result.current.language).toBe('hi')
  })

  it('starts listening when startListening is called', () => {
    const { result } = renderHook(() => useVoiceInput())
    
    act(() => {
      result.current.startListening()
    })
    
    expect(mockRecognition.start).toHaveBeenCalled()
  })

  it('stops listening when stopListening is called', () => {
    const { result } = renderHook(() => useVoiceInput())
    
    // First start listening
    act(() => {
      result.current.startListening()
    })
    
    // Then stop
    act(() => {
      result.current.stopListening()
    })
    
    expect(mockRecognition.stop).toHaveBeenCalled()
  })

  it('changes language correctly', () => {
    const { result } = renderHook(() => useVoiceInput())
    
    act(() => {
      result.current.setLanguage('hi')
    })
    
    expect(result.current.language).toBe('hi')
  })

  it('sets correct language code for Hindi', () => {
    const { result } = renderHook(() => useVoiceInput({ language: 'hi' }))
    
    expect(mockRecognition.lang).toBe('hi-IN')
  })

  it('sets correct language code for English', () => {
    const { result } = renderHook(() => useVoiceInput({ language: 'en' }))
    
    expect(mockRecognition.lang).toBe('en-IN')
  })
})
