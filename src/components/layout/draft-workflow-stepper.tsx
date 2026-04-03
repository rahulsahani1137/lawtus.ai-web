/**
 * DraftWorkflowStepper Component
 * 
 * A persistent stepper/progress bar showing the user's position in the 
 * 6-step drafting workflow. Shows completed, current, and future steps.
 * Allows navigation to completed steps while locking future steps.
 */

'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CaseStatus } from '@/types/cldi'
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Upload, 
  CheckCircle2, 
  FileCheck,
  Check,
  Lock
} from 'lucide-react'
import Link from 'next/link'

interface WorkflowStep {
  id: number
  title: string
  shortTitle: string
  icon: React.ComponentType<{ className?: string }>
  status: CaseStatus | 'draft_type'
  href?: string
}

interface DraftWorkflowStepperProps {
  caseId?: string
  currentStatus: CaseStatus | 'draft_type'
  className?: string
}

/**
 * Maps case status to step completion state
 */
function getStepState(
  stepStatus: CaseStatus | 'draft_type',
  currentStatus: CaseStatus | 'draft_type'
): 'completed' | 'current' | 'locked' {
  const statusOrder: (CaseStatus | 'draft_type')[] = [
    'draft_type',
    'interrogating',
    'chronology',
    'document_upload',
    'contradiction_found',
    'drafting',
    'complete'
  ]

  const stepIndex = statusOrder.indexOf(stepStatus)
  const currentIndex = statusOrder.indexOf(currentStatus)

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'locked'
}

/**
 * Get status badge variant and label
 */
function getStatusBadge(status: CaseStatus | 'draft_type'): { 
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  label: string 
} {
  switch (status) {
    case 'draft_type':
      return { variant: 'secondary', label: 'Draft Type' }
    case 'interrogating':
      return { variant: 'default', label: 'Fact Collection' }
    case 'chronology':
      return { variant: 'default', label: 'Chronology' }
    case 'document_upload':
      return { variant: 'default', label: 'Documents' }
    case 'contradiction_found':
      return { variant: 'destructive', label: 'Review Required' }
    case 'drafting':
      return { variant: 'default', label: 'Drafting' }
    case 'complete':
      return { variant: 'outline', label: 'Complete' }
    default:
      return { variant: 'secondary', label: 'Unknown' }
  }
}

export function DraftWorkflowStepper({ 
  caseId, 
  currentStatus,
  className 
}: DraftWorkflowStepperProps) {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Draft Type',
      shortTitle: 'Type',
      icon: FileText,
      status: 'draft_type',
      href: caseId ? undefined : '/drafts/new'
    },
    {
      id: 2,
      title: 'Fact Collection',
      shortTitle: 'Facts',
      icon: MessageSquare,
      status: 'interrogating',
      href: caseId ? `/drafts/${caseId}/interrogate` : undefined
    },
    {
      id: 3,
      title: 'Chronology',
      shortTitle: 'Timeline',
      icon: Clock,
      status: 'chronology',
      href: caseId ? `/drafts/${caseId}/chronology` : undefined
    },
    {
      id: 4,
      title: 'Documents',
      shortTitle: 'Docs',
      icon: Upload,
      status: 'document_upload',
      href: caseId ? `/drafts/${caseId}/documents` : undefined
    },
    {
      id: 5,
      title: 'Review',
      shortTitle: 'Review',
      icon: CheckCircle2,
      status: 'contradiction_found',
      href: caseId ? `/drafts/${caseId}/review` : undefined
    },
    {
      id: 6,
      title: 'Generate Draft',
      shortTitle: 'Draft',
      icon: FileCheck,
      status: 'drafting',
      href: caseId ? `/drafts/${caseId}/draft` : undefined
    }
  ]

  const statusBadge = getStatusBadge(currentStatus)

  return (
    <div className={cn('w-full', className)}>
      {/* Status Badge */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Drafting Workflow
        </h3>
        <Badge variant={statusBadge.variant}>
          {statusBadge.label}
        </Badge>
      </div>

      {/* Stepper */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-0.5 bg-border" />
        
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const state = getStepState(step.status, currentStatus)
            const Icon = step.icon
            const isClickable = state === 'completed' && step.href
            const isCurrent = state === 'current'
            const isLocked = state === 'locked'

            const StepContent = (
              <div
                className={cn(
                  'relative flex items-center gap-3 rounded-lg p-3 transition-all',
                  isClickable && 'cursor-pointer hover:bg-accent',
                  isCurrent && 'bg-accent/50',
                  isLocked && 'opacity-50'
                )}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    state === 'completed' && 'border-primary bg-primary text-primary-foreground',
                    state === 'current' && 'border-primary bg-background text-primary',
                    state === 'locked' && 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {state === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : state === 'locked' ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-foreground',
                      state === 'completed' && 'text-foreground',
                      isLocked && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {state === 'completed' && 'Completed'}
                    {state === 'current' && 'In Progress'}
                    {state === 'locked' && 'Locked'}
                  </p>
                </div>

                {/* Step Number */}
                <div
                  className={cn(
                    'text-xs font-medium',
                    isCurrent && 'text-primary',
                    state === 'completed' && 'text-muted-foreground',
                    isLocked && 'text-muted-foreground'
                  )}
                >
                  {step.id}/6
                </div>
              </div>
            )

            return (
              <div key={step.id}>
                {isClickable ? (
                  <Link href={step.href!}>
                    {StepContent}
                  </Link>
                ) : (
                  StepContent
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
