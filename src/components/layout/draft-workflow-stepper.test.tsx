/**
 * DraftWorkflowStepper Test/Example Component
 * 
 * This file demonstrates the DraftWorkflowStepper component in various states.
 * Can be used for visual testing and documentation.
 */

'use client'

import { DraftWorkflowStepper } from './draft-workflow-stepper'
import { CaseStatus } from '@/types/cldi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DraftWorkflowStepperExamples() {
  const exampleCaseId = '123e4567-e89b-12d3-a456-426614174000'

  const examples: Array<{
    title: string
    description: string
    status: CaseStatus | 'draft_type'
    caseId?: string
  }> = [
    {
      title: 'Draft Type Selection',
      description: 'User is selecting the type of draft to create',
      status: 'draft_type',
    },
    {
      title: 'Fact Collection',
      description: 'User is answering questions to collect case facts',
      status: 'interrogating',
      caseId: exampleCaseId,
    },
    {
      title: 'Chronology Building',
      description: 'User is reviewing and organizing the timeline',
      status: 'chronology',
      caseId: exampleCaseId,
    },
    {
      title: 'Document Upload',
      description: 'User is uploading supporting documents',
      status: 'document_upload',
      caseId: exampleCaseId,
    },
    {
      title: 'Contradiction Review',
      description: 'System found contradictions that need resolution',
      status: 'contradiction_found',
      caseId: exampleCaseId,
    },
    {
      title: 'Drafting',
      description: 'System is generating the final draft',
      status: 'drafting',
      caseId: exampleCaseId,
    },
    {
      title: 'Complete',
      description: 'Draft has been generated and approved',
      status: 'complete',
      caseId: exampleCaseId,
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Draft Workflow Stepper</h1>
        <p className="text-muted-foreground">
          Visual examples of the stepper component in different workflow states
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Card key={example.status}>
            <CardHeader>
              <CardTitle className="text-lg">{example.title}</CardTitle>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <DraftWorkflowStepper
                currentStatus={example.status}
                caseId={example.caseId}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use the DraftWorkflowStepper component in your pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'

// In your page component
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
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
