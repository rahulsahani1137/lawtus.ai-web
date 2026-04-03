# Layout Components

This directory contains layout-level components used across the CLDI application.

## Components

### DraftWorkflowStepper

A persistent stepper/progress bar showing the user's position in the 6-step drafting workflow.

**Features:**
- Shows all 6 workflow steps with icons
- Highlights the current step
- Shows completed steps with checkmarks
- Locks future steps (grayed out, not clickable)
- Allows navigation to completed steps
- Displays case status badge

**Workflow Steps:**
1. Draft Type Selection
2. Fact Collection (Interrogation)
3. Chronology Building
4. Document Upload
5. Review (Contradiction Resolution)
6. Generate Draft

**Usage:**

```tsx
import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

export default function DraftPage({ params }: { params: { caseId: string } }) {
  const { data: caseData } = useQuery({
    queryKey: ['case', params.caseId],
    queryFn: () => fetchCase(params.caseId)
  })

  return (
    <div className="flex gap-6">
      {/* Sidebar with stepper */}
      <aside className="w-80 shrink-0">
        <DraftWorkflowStepper
          caseId={params.caseId}
          currentStatus={caseData?.status || 'interrogating'}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Your page content */}
      </main>
    </div>
  )
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `caseId` | `string` | No | The case ID for navigation links. If not provided, navigation is disabled. |
| `currentStatus` | `CaseStatus \| 'draft_type'` | Yes | The current workflow status of the case. |
| `className` | `string` | No | Additional CSS classes to apply to the container. |

**Status Values:**

The component accepts the following status values from the `CaseStatus` enum:

- `'draft_type'` - Draft type selection (initial state)
- `'interrogating'` - Fact collection phase
- `'chronology'` - Chronology building phase
- `'document_upload'` - Document upload phase
- `'contradiction_found'` - Review/contradiction resolution phase
- `'drafting'` - Draft generation phase
- `'complete'` - Workflow complete

**Visual States:**

Each step can be in one of three states:

1. **Completed** - Green checkmark, clickable (if `caseId` provided)
2. **Current** - Highlighted with accent background, shows step icon
3. **Locked** - Grayed out with lock icon, not clickable

**Status Badge:**

The component displays a status badge at the top that reflects the current workflow state:

- Draft Type - Secondary badge
- Fact Collection - Primary badge
- Chronology - Primary badge
- Documents - Primary badge
- Review Required - Destructive badge (red)
- Drafting - Primary badge
- Complete - Outline badge

### CLDIBreadcrumb

A breadcrumb navigation component for the CLDI workflow.

**Usage:**

```tsx
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'

export default function Page({ params }: { params: { caseId: string } }) {
  return (
    <div>
      <CLDIBreadcrumb 
        caseId={params.caseId}
        caseTitle="Bail Application - Ramesh Kumar"
      />
      {/* Page content */}
    </div>
  )
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `caseId` | `string` | No | The case ID for breadcrumb links |
| `caseTitle` | `string` | No | The case title to display in breadcrumbs |

## Design Patterns

### Responsive Layout

Layout components should be responsive and work well on mobile, tablet, and desktop screens.

### Accessibility

All layout components should:
- Use semantic HTML elements
- Include proper ARIA labels where needed
- Support keyboard navigation
- Maintain sufficient color contrast

### Consistency

Layout components should follow the existing design system:
- Use shadcn/ui components where possible
- Follow Tailwind CSS conventions
- Use lucide-react icons
- Maintain consistent spacing and typography
