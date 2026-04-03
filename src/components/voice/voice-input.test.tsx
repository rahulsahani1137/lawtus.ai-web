/**
 * @vitest-environment jsdom
 */

/**
 * VoiceInput Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VoiceInput } from './voice-input'

// Mock the useVoiceInput hook
vi.mock('@/hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    isSupported: true,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    state: 'idle',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    cancelListening: vi.fn(),
    setLanguage: vi.fn(),
    language: 'en',
  }),
}))

describe('VoiceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders microphone button when supported', () => {
    render(<VoiceInput />)
    
    const micButton = screen.getByTitle('Start voice input')
    expect(micButton).toBeDefined()
  })

  it('renders language selector by default', () => {
    render(<VoiceInput showLanguageSelector={true} />)
    
    const langButton = screen.getByText('English')
    expect(langButton).toBeDefined()
  })

  it('hides language selector when showLanguageSelector is false', () => {
    render(<VoiceInput showLanguageSelector={false} />)
    
    const langButton = screen.queryByText('English')
    expect(langButton).toBeNull()
  })
})
