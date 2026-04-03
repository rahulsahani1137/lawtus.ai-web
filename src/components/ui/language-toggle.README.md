# LanguageToggle Component

A React component that automatically detects Hindi (Devanagari script) input and provides language toggle functionality for text inputs.

## Features

- **Automatic Detection**: Detects Hindi text in real-time based on Devanagari character percentage
- **Visual Indicator**: Shows a badge when Hindi is detected with the percentage
- **Manual Toggle**: Allows users to manually switch between Hindi and English input modes
- **Preservation Notice**: Informs users that original Hindi text will be preserved alongside translations
- **Customizable Threshold**: Configure the detection threshold (default: 20%)

## Usage

### Basic Usage

```tsx
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Textarea } from '@/components/ui/textarea'

function MyComponent() {
  const [value, setValue] = useState('')
  const [language, setLanguage] = useState<'hi' | 'en'>('en')

  return (
    <LanguageToggle 
      value={value} 
      onLanguageChange={setLanguage}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type in Hindi or English..."
      />
    </LanguageToggle>
  )
}
```

### With Custom Threshold

```tsx
<LanguageToggle 
  value={value}
  threshold={0.3} // Require 30% Hindi to trigger detection
>
  <Textarea value={value} onChange={handleChange} />
</LanguageToggle>
```

### Auto-detect Only (No Manual Toggle)

```tsx
<LanguageToggle 
  value={value}
  showToggle={false}
>
  <Input value={value} onChange={handleChange} />
</LanguageToggle>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | Required | The current input value to analyze |
| `onLanguageChange` | `(language: 'hi' \| 'en') => void` | Optional | Callback when language mode changes |
| `children` | `ReactNode` | Required | Input components to wrap |
| `className` | `string` | Optional | Additional CSS classes for the wrapper |
| `showToggle` | `boolean` | `true` | Show manual toggle button |
| `threshold` | `number` | `0.2` | Detection threshold (0-1, where 0.2 = 20%) |

## How It Works

1. **Detection**: The component analyzes the input text in real-time using the `detectHindi` function from `@/lib/lang-detect`
2. **Threshold**: When Devanagari characters exceed the threshold percentage (default 20%), Hindi is detected
3. **Badge Display**: A badge appears showing "Hindi detected (X%) — will be translated"
4. **Manual Override**: Users can manually toggle between Hindi and English input modes
5. **Preservation**: When Hindi is detected, a note informs users that the original text will be preserved

## Language Detection Logic

The component uses the following utilities from `@/lib/lang-detect`:

- `detectHindi(text, threshold)`: Returns `true` if Hindi percentage exceeds threshold
- `getHindiPercentage(text)`: Returns the percentage of Devanagari characters (0-1)
- `getLanguage(text)`: Returns `'hi'` or `'en'` based on detection

### Detection Algorithm

1. Count Devanagari characters (Unicode range U+0900 to U+097F)
2. Count total non-whitespace characters
3. Calculate percentage: `devanagariCount / totalChars`
4. Compare against threshold (default: 0.2 = 20%)

## Integration with AnswerInput

The LanguageToggle component is integrated into the `AnswerInput` component for text-type questions:

```tsx
// In answer-input.tsx
if (questionType === 'text') {
  return (
    <LanguageToggle value={value} onLanguageChange={onLanguageChange}>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Enter your answer here..."
      />
    </LanguageToggle>
  )
}
```

## Testing

The component includes comprehensive unit tests for the language detection logic:

```bash
bun test src/components/ui/language-toggle.test.tsx --run
```

Tests cover:
- Hindi detection at various thresholds
- English text handling
- Mixed Hindi-English content
- Empty and whitespace-only strings
- Custom threshold configurations
- Percentage calculations

## Styling

The component uses Tailwind CSS classes and integrates with the existing UI component library:

- Badge: Uses the `Badge` component with `secondary` variant
- Button: Uses the `Button` component with `ghost` variant and `sm` size
- Icons: Uses `lucide-react` icons (`Languages`)

## Accessibility

- Toggle button includes a descriptive `title` attribute
- Badge provides clear visual feedback
- Preservation notice is readable by screen readers

## Future Enhancements

- Support for additional languages (Punjabi, Tamil, etc.)
- Voice input integration
- Translation preview
- Language-specific input validation
- Keyboard shortcuts for language switching

## Related Components

- `AnswerInput`: Integrates LanguageToggle for text inputs
- `Badge`: Used for the detection indicator
- `Button`: Used for the manual toggle

## Related Utilities

- `@/lib/lang-detect`: Language detection utilities
- `@/lib/utils`: General utility functions (cn)
