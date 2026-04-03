# DraftWorkflowStepper Component Specification

## Overview

The `DraftWorkflowStepper` is a persistent navigation and progress indicator component that guides users through the 6-step legal drafting workflow. It provides visual feedback on progress, allows navigation to completed steps, and prevents access to future steps.

## Component Behavior

### Step States

Each step in the workflow can be in one of three states:

#### 1. Completed State
- **Visual**: Green circle with white checkmark icon
- **Behavior**: Clickable (if `caseId` is provided)
- **Text**: "Completed" status label
- **Navigation**: Links to the step's page

#### 2. Current State
- **Visual**: White circle with blue border and step icon
- **Background**: Light accent background on the entire step
- **Text**: "In Progress" status label
- **Navigation**: Not clickable (already on this page)

#### 3. Locked State
- **Visual**: Gray circle with lock icon
- **Opacity**: 50% opacity on entire step
- **Text**: "Locked" status label
- **Navigation**: Not clickable

### Workflow Steps

| Step | Title | Icon | Status Value | Route |
|------|-------|------|--------------|-------|
| 1 | Draft Type | FileText | `draft_type` | `/drafts/new` |
| 2 | Fact Collection | MessageSquare | `interrogating` | `/drafts/[caseId]/interrogate` |
| 3 | Chronology | Clock | `chronology` | `/drafts/[caseId]/chronology` |
| 4 | Documents | Upload | `document_upload` | `/drafts/[caseId]/documents` |
| 5 | Review | CheckCircle2 | `contradiction_found` | `/drafts/[caseId]/review` |
| 6 | Generate Draft | FileCheck | `drafting` | `/drafts/[caseId]/draft` |

### Status Badge Mapping

The component displays a status badge at the top that reflects the current workflow state:

| Status | Badge Variant | Badge Label |
|--------|---------------|-------------|
| `draft_type` | secondary | Draft Type |
| `interrogating` | default | Fact Collection |
| `chronology` | default | Chronology |
| `document_upload` | default | Documents |
| `contradiction_found` | destructive | Review Required |
| `drafting` | default | Drafting |
| `complete` | outline | Complete |

## Props API

```typescript
interface DraftWorkflowStepperProps {
  /**
   * The case ID for generating navigation links.
   * If not provided, navigation will be disabled.
   */
  caseId?: string

  /**
   * The current workflow status of the case.
   * Determines which step is highlighted and which steps are accessible.
   */
  currentStatus: CaseStatus | 'draft_type'

  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string
}
```

## Visual Design

### Layout Structure

```
┌─────────────────────────────────────┐
│ Drafting Workflow    [Status Badge] │
├─────────────────────────────────────┤
│                                     │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┃  ✓  Draft Type                  │
│  ┃     Completed              1/6  │
│  ┃                                  │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┃  ✓  Fact Collection             │
│  ┃     Completed              2/6  │
│  ┃                                  │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┃  ⏱  Chronology                  │
│  ┃     In Progress            3/6  │ ← Current
│  ┃                                  │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┃  🔒 Documents                   │
│  ┃     Locked                 4/6  │
│  ┃                                  │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┃  🔒 Review                      │
│  ┃     Locked                 5/6  │
│  ┃                                  │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│     🔒 Generate Draft               │
│        Locked                 6/6  │
│                                     │
└─────────────────────────────────────┘
```

### Color Scheme

- **Completed**: Primary color (blue/green)
- **Current**: Primary color with accent background
- **Locked**: Muted/gray with reduced opacity
- **Progress Line**: Border color (light gray)

### Spacing

- Container padding: Standard card padding
- Step spacing: 1rem (16px) between steps
- Icon size: 2rem (32px) diameter
- Icon inner size: 1rem (16px)

## Accessibility

### Keyboard Navigation

- Completed steps are keyboard accessible via Tab key
- Enter/Space activates navigation to completed steps
- Locked steps are not in tab order

### Screen Readers

- Each step announces its state (completed/current/locked)
- Step numbers are announced (e.g., "Step 3 of 6")
- Status badge is announced with its variant

### ARIA Attributes

```tsx
// Completed step (clickable)
<Link 
  href="/drafts/123/interrogate"
  aria-label="Go to Fact Collection (completed)"
  aria-current={false}
>

// Current step
<div 
  aria-label="Chronology (in progress)"
  aria-current="step"
>

// Locked step
<div 
  aria-label="Documents (locked)"
  aria-disabled="true"
>
```

## Responsive Behavior

### Desktop (≥1024px)
- Full width with all text visible
- Sidebar width: 320px (w-80)

### Tablet (768px - 1023px)
- Slightly narrower sidebar
- All text still visible

### Mobile (<768px)
- Consider collapsing to horizontal stepper
- Or show only current step with dropdown
- (To be implemented in future iteration)

## Integration Examples

### Basic Usage

```tsx
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

export default function CasePage({ params }) {
  return (
    <div className="flex gap-6">
      <aside className="w-80">
        <DraftWorkflowStepper
          caseId={params.caseId}
          currentStatus="chronology"
        />
      </aside>
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  )
}
```

### With React Query

```tsx
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'
import { useQuery } from '@tanstack/react-query'

export default function CasePage({ params }) {
  const { data: caseData } = useQuery({
    queryKey: ['case', params.caseId],
    queryFn: () => fetchCase(params.caseId)
  })

  if (!caseData) return <div>Loading...</div>

  return (
    <div className="flex gap-6">
      <aside className="w-80">
        <DraftWorkflowStepper
          caseId={params.caseId}
          currentStatus={caseData.status}
        />
      </aside>
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Without Case ID (New Draft)

```tsx
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

export default function NewDraftPage() {
  return (
    <div className="flex gap-6">
      <aside className="w-80">
        <DraftWorkflowStepper
          currentStatus="draft_type"
          // No caseId - navigation disabled
        />
      </aside>
      <main className="flex-1">
        {/* Draft type selection */}
      </main>
    </div>
  )
}
```

## Testing Checklist

- [ ] All 7 status states render correctly
- [ ] Completed steps are clickable and navigate correctly
- [ ] Current step is highlighted with accent background
- [ ] Locked steps are not clickable
- [ ] Status badge updates correctly
- [ ] Progress line connects all steps
- [ ] Icons render correctly for each state
- [ ] Step numbers display correctly (1/6 through 6/6)
- [ ] Hover states work on clickable steps
- [ ] Keyboard navigation works for completed steps
- [ ] Screen reader announces step states correctly
- [ ] Component works without caseId prop
- [ ] Component works with all CaseStatus values
- [ ] No TypeScript errors
- [ ] No console warnings

## Future Enhancements

1. **Mobile Responsive Design**
   - Horizontal stepper for mobile devices
   - Collapsible stepper with current step visible

2. **Animations**
   - Smooth transitions between states
   - Progress line animation on step completion

3. **Tooltips**
   - Show step description on hover
   - Show lock reason for locked steps

4. **Customization**
   - Allow custom icons per step
   - Allow custom colors per step
   - Allow hiding specific steps

5. **Analytics**
   - Track step navigation events
   - Track time spent on each step
   - Track completion rates

## Dependencies

- `lucide-react` - Icons
- `@/components/ui/badge` - Status badge
- `@/types/cldi` - Type definitions
- `@/lib/utils` - cn utility for class merging
- `next/link` - Navigation
