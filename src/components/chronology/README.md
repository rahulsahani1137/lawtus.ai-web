# Chronology Components

This directory contains components for building and managing chronological timelines in legal cases.

## Components

### ContradictionDialog

A dialog component for resolving contradictions detected in case facts.

**Features:**
- Displays contradictions with source A vs source B comparison
- Allows user to select which source is correct
- Supports manual resolution entry
- Progress indicator for multiple contradictions
- Skip functionality for non-critical contradictions

**Usage:**

```tsx
import { ContradictionDialog } from '@/components/chronology/contradiction-dialog'
import type { Contradiction } from '@/types/cldi'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const contradictions: Contradiction[] = [
    {
      id: 'c1',
      caseId: 'case-1',
      description: 'Arrest date mismatch',
      sourceA: 'FIR states arrest on Jan 15',
      sourceB: 'User statement says Jan 16',
      field: 'Arrest Date',
      isResolved: false,
    }
  ]

  const handleResolve = async (contradictionId: string, resolution: string) => {
    // Call API to save resolution
    await api.resolveContradiction(contradictionId, resolution)
    // Update chronology with resolved data
  }

  return (
    <ContradictionDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      contradictions={contradictions}
      onResolve={handleResolve}
    />
  )
}
```

**Props:**

- `open` (boolean): Controls dialog visibility
- `onOpenChange` (function): Callback when dialog should open/close
- `contradictions` (Contradiction[]): Array of contradictions to resolve
- `onResolve` (function): Async callback when user resolves a contradiction
  - Parameters: `(contradictionId: string, resolution: string) => Promise<void>`
- `isLoading` (boolean, optional): Disables interactions while loading

**Behavior:**

1. Shows contradictions one at a time with progress indicator
2. User can click "Use This" on either source to quickly select it
3. User can manually type a custom resolution
4. "Skip for Now" button available when multiple contradictions exist
5. After resolving last contradiction, dialog closes automatically
6. All buttons disabled during resolution to prevent double-submission

### ChronologyTimeline

A vertical timeline component for displaying and managing chronological events.

**Usage:**

```tsx
import { ChronologyTimeline } from '@/components/chronology/timeline'

function MyPage() {
  const events = useChronologyEvents(caseId)

  return (
    <ChronologyTimeline
      caseId={caseId}
      events={events}
      onAddEvent={handleAddEvent}
      onEditEvent={handleEditEvent}
      onDeleteEvent={handleDeleteEvent}
      onVerify={handleVerify}
    />
  )
}
```

### EventCard

Individual event card component with inline editing capabilities.

### AddEventDialog

Dialog for manually adding new events to the timeline.

## Integration Example

Here's a complete example of integrating contradiction detection with the chronology workflow:

```tsx
'use client'

import { useState } from 'react'
import { ChronologyTimeline } from '@/components/chronology/timeline'
import { ContradictionDialog } from '@/components/chronology/contradiction-dialog'
import { Button } from '@/components/ui/button'
import { useChronology } from '@/hooks/useChronology'
import { useContradictions } from '@/hooks/useContradictions'

export function ChronologyPage({ caseId }: { caseId: string }) {
  const [showContradictions, setShowContradictions] = useState(false)
  
  const {
    events,
    addEvent,
    editEvent,
    deleteEvent,
    verifyChronology,
    isLoading
  } = useChronology(caseId)

  const {
    contradictions,
    detectContradictions,
    resolveContradiction,
    isDetecting
  } = useContradictions(caseId)

  const handleVerify = async () => {
    // First, check for contradictions
    await detectContradictions()
    
    if (contradictions.length > 0) {
      // Show contradiction dialog
      setShowContradictions(true)
    } else {
      // No contradictions, proceed with verification
      await verifyChronology()
    }
  }

  const handleResolveContradiction = async (
    contradictionId: string,
    resolution: string
  ) => {
    await resolveContradiction(contradictionId, resolution)
    
    // If all contradictions resolved, verify chronology
    const remaining = contradictions.filter(c => c.id !== contradictionId)
    if (remaining.length === 0) {
      await verifyChronology()
    }
  }

  return (
    <div>
      <ChronologyTimeline
        caseId={caseId}
        events={events}
        onAddEvent={addEvent}
        onEditEvent={editEvent}
        onDeleteEvent={deleteEvent}
        onVerify={handleVerify}
        isLoading={isLoading || isDetecting}
      />

      <ContradictionDialog
        open={showContradictions}
        onOpenChange={setShowContradictions}
        contradictions={contradictions}
        onResolve={handleResolveContradiction}
        isLoading={isLoading}
      />
    </div>
  )
}
```

## Styling

All components use Tailwind CSS and shadcn/ui components for consistent styling:

- Event types are color-coded:
  - Evidence: Green
  - Procedural: Blue
  - Adverse: Red
  - Neutral: Gray

- Contradictions use:
  - Source A: Blue background
  - Source B: Amber background

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation supported
- Focus management in dialogs
- Screen reader friendly
