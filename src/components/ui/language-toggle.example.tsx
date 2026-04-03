/**
 * LanguageToggle Component Usage Examples
 * 
 * This file demonstrates how to use the LanguageToggle component
 * in different scenarios.
 */

'use client'

import { useState } from 'react'
import { LanguageToggle } from './language-toggle'
import { Textarea } from './textarea'
import { Input } from './input'

/**
 * Example 1: Basic usage with textarea
 */
export function BasicExample() {
  const [value, setValue] = useState('')
  const [language, setLanguage] = useState<'hi' | 'en'>('en')

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Basic Example</h3>
      <LanguageToggle 
        value={value} 
        onLanguageChange={setLanguage}
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type in Hindi or English..."
          className="min-h-[120px]"
        />
      </LanguageToggle>
      <p className="text-sm text-muted-foreground">
        Current language: {language === 'hi' ? 'Hindi' : 'English'}
      </p>
    </div>
  )
}

/**
 * Example 2: With custom threshold
 */
export function CustomThresholdExample() {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Custom Threshold (30%)</h3>
      <LanguageToggle 
        value={value}
        threshold={0.3} // Require 30% Hindi to trigger detection
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type in Hindi or English..."
          className="min-h-[120px]"
        />
      </LanguageToggle>
    </div>
  )
}

/**
 * Example 3: Without manual toggle
 */
export function AutoDetectOnlyExample() {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Auto-detect Only (No Toggle)</h3>
      <LanguageToggle 
        value={value}
        showToggle={false} // Hide manual toggle button
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type in Hindi or English..."
        />
      </LanguageToggle>
    </div>
  )
}

/**
 * Example 4: Integration with form
 */
export function FormIntegrationExample() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [descriptionLanguage, setDescriptionLanguage] = useState<'hi' | 'en'>('en')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', {
      ...formData,
      descriptionLanguage,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Form Integration</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <LanguageToggle 
          value={formData.description}
          onLanguageChange={setDescriptionLanguage}
        >
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your case in Hindi or English..."
            className="min-h-[120px]"
          />
        </LanguageToggle>
      </div>

      <button 
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Submit
      </button>
    </form>
  )
}

/**
 * Example 5: Pre-filled Hindi text
 */
export function PrefilledHindiExample() {
  const [value, setValue] = useState('मैं एक वकील हूं और मुझे कानूनी सहायता चाहिए।')

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Pre-filled Hindi Text</h3>
      <LanguageToggle value={value}>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[120px]"
        />
      </LanguageToggle>
    </div>
  )
}
