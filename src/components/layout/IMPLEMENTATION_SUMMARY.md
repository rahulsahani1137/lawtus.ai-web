# DraftWorkflowStepper Implementation Summary

## Task: FTASK-005 - Build Draft Workflow Stepper Component

**Status**: ✅ Completed  
**Date**: March 29, 2026  
**Priority**: P0

## What Was Implemented

### Core Component
- **File**: `draft-workflow-stepper.tsx`
- **Description**: A persistent stepper/progress bar showing the user's position in the 6-step drafting workflow
- **Features**:
  - ✅ Shows all 6 workflow steps with icons
  - ✅ Highlights the current step with accent background
  - ✅ Shows completed steps with green checkmarks
  - ✅ Locks future steps (grayed out with lock icon, not clickable)
  - ✅ Allows navigation to completed steps via Next.js Link
  - ✅ Displays case status badge at the top
  - ✅ Responsive design with proper spacing
  - ✅ Accessible with proper ARIA attributes

### Workflow Steps Implemented

1. **Draft Type Selection** (`draft_type`)
   - Icon: FileText
   - Route: `/drafts/new`

2. **Fact Collection** (`interrogating`)
   - Icon: MessageSquare
   - Route: `/drafts/[caseId]/interrogate`

3. **Chronology** (`chronology`)
   - Icon: Clock
   - Route: `/drafts/[caseId]/chronology`

4. **Documents** (`document_upload`)
   - Icon: Upload
   - Route: `/drafts/[caseId]/documents`

5. **Review** (`contradiction_found`)
   - Icon: CheckCircle2
   - Route: `/drafts/[caseId]/review`

6. **Generate Draft** (`drafting`)
   - Icon: FileCheck
   - Route: `/drafts/[caseId]/draft`

### Status Badge Mapping

The component correctly maps all backend `case_status` enum values to appropriate badge variants:

| Backend Status | Badge Variant | Display Label |
|----------------|---------------|---------------|
| `draft_type` | secondary | Draft Type |
| `interrogating` | default (primary) | Fact Collection |
| `chronology` | default (primary) | Chronology |
| `document_upload` | default (primary) | Documents |
| `contradiction_found` | destructive (red) | Review Required |
| `drafting` | default (primary) | Drafting |
| `complete` | outline | Complete |

### Supporting Files

1. **Test/Example Component** (`draft-workflow-stepper.test.tsx`)
   - Visual examples of all 7 workflow states
   - Usage documentation with code examples
   - Can be used for visual testing and documentation

2. **Layout Example** (`layout-example.tsx`)
   - Shows how to integrate the stepper into a page layout
   - Demonstrates sidebar + main content pattern
   - Includes breadcrumb integration

3. **Documentation**
   - `README.md` - Component usage guide
   - `COMPONENT_SPEC.md` - Detailed specification
   - `index.ts` - Centralized exports

## Technical Implementation

### Component Logic

#### Step State Calculation
```typescript
function getStepState(
  stepStatus: CaseStatus | 'draft_type',
  currentStatus: CaseStatus | 'draft_type'
): 'completed' | 'current' | 'locked'
```

The component uses a status order array to determine if a step is:
- **Completed**: Step index < current index
- **Current**: Step index === current index
- **Locked**: Step index > current index

#### Navigation Logic
- Completed steps with `caseId` prop → Wrapped in Next.js `<Link>`
- Current step → Not clickable (already on this page)
- Locked steps → Not clickable (prerequisites not met)
- No `caseId` prop → All navigation disabled

### Visual Design

#### Colors & States
- **Completed**: Primary color (blue/green) with checkmark
- **Current**: Primary border with accent background
- **Locked**: Muted gray with 50% opacity and lock icon

#### Layout
- Vertical timeline with connecting line
- Icon circles: 32px diameter
- Step spacing: 16px between steps
- Responsive padding and margins

### Dependencies Used

- `lucide-react` - Icons (FileText, MessageSquare, Clock, Upload, CheckCircle2, FileCheck, Check, Lock)
- `@/components/ui/badge` - Status badge component
- `@/types/cldi` - CaseStatus type definitions
- `@/lib/utils` - cn utility for class merging
- `next/link` - Client-side navigation

## Acceptance Criteria Verification

✅ **Stepper renders correctly for all 6 steps**
- All 6 steps display with correct icons and labels
- Progress line connects all steps visually

✅ **Locked steps not clickable**
- Future steps show lock icon
- No href attribute on locked steps
- Cursor remains default (not pointer)

✅ **Current step highlighted**
- Accent background applied to current step
- Primary color border on icon circle
- "In Progress" status label

✅ **Status badge matches backend case_status enum**
- All 7 status values mapped correctly
- Badge variants match design system
- Labels are user-friendly

## Testing

### Manual Testing Checklist
- [x] Component renders without errors
- [x] All 7 status states display correctly
- [x] Navigation works for completed steps
- [x] Locked steps are not clickable
- [x] Status badge updates correctly
- [x] Icons render correctly
- [x] TypeScript types are correct
- [x] No console warnings or errors

### TypeScript Diagnostics
```
✅ draft-workflow-stepper.tsx: No diagnostics found
✅ draft-workflow-stepper.test.tsx: No diagnostics found
✅ index.ts: No diagnostics found
```

## Integration Guide

### Basic Usage

```tsx
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

export default function CasePage({ params }: { params: { caseId: string } }) {
  const { data: caseData } = useQuery({
    queryKey: ['case', params.caseId],
    queryFn: () => fetchCase(params.caseId)
  })

  return (
    <div className="flex gap-6">
      <aside className="w-80 shrink-0">
        <DraftWorkflowStepper
          caseId={params.caseId}
          currentStatus={caseData?.status || 'interrogating'}
        />
      </aside>
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Import Options

```tsx
// Direct import
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

// From index (recommended)
import { DraftWorkflowStepper } from '@/components/layout'
```

## Files Created

1. `lawtus.ai-web/src/components/layout/draft-workflow-stepper.tsx` - Main component
2. `lawtus.ai-web/src/components/layout/draft-workflow-stepper.test.tsx` - Test/example component
3. `lawtus.ai-web/src/components/layout/index.ts` - Centralized exports
4. `lawtus.ai-web/src/components/layout/README.md` - Usage documentation
5. `lawtus.ai-web/src/components/layout/COMPONENT_SPEC.md` - Detailed specification
6. `lawtus.ai-web/src/app/(main)/drafts/[caseId]/layout-example.tsx` - Integration example

## Next Steps

The component is ready for integration into the actual page layouts. The next tasks should:

1. **FTASK-006**: Integrate the stepper into the New Draft page
2. **FTASK-009**: Integrate the stepper into the Fact Collection page
3. **FTASK-012**: Integrate the stepper into the Chronology page
4. **FTASK-015**: Integrate the stepper into the Documents page
5. **FTASK-019**: Integrate the stepper into the Review page

## Notes

- The component is fully typed with TypeScript
- All icons are from lucide-react (already installed)
- The component follows the existing design system patterns
- No additional dependencies required
- Component is accessible and keyboard-navigable
- Ready for production use

## Completion

✅ Task FTASK-005 is complete and ready for review.
