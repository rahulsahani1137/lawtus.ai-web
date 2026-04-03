/**
 * Example Layout Integration
 * 
 * This file demonstrates how to integrate the DraftWorkflowStepper
 * into a case detail page layout.
 * 
 * NOTE: This is an example file for reference. The actual implementation
 * should be done in the respective page files.
 */

'use client'

import { DraftWorkflowStepper } from '@/components/layout/draft-workflow-stepper'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { CaseStatus } from '@/types/cldi'
import { ReactNode } from 'react'

interface CaseLayoutExampleProps {
  caseId: string
  caseTitle: string
  currentStatus: CaseStatus
  children: ReactNode
}

/**
 * Example layout component showing how to integrate the stepper
 * into a case detail page with sidebar navigation.
 */
export function CaseLayoutExample({
  caseId,
  caseTitle,
  currentStatus,
  children
}: CaseLayoutExampleProps) {
  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <CLDIBreadcrumb caseId={caseId} caseTitle={caseTitle} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Sidebar with Workflow Stepper */}
        <aside className="w-80 shrink-0 space-y-6">
          <DraftWorkflowStepper
            caseId={caseId}
            currentStatus={currentStatus}
          />

          {/* Additional sidebar content can go here */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2">Case Information</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Case ID</dt>
                <dd className="font-mono text-xs">{caseId.slice(0, 8)}...</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Title</dt>
                <dd>{caseTitle}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{currentStatus.replace('_', ' ')}</dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="rounded-lg border bg-card">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Example usage in a page component:
 * 
 * ```tsx
 * // app/(main)/drafts/[caseId]/interrogate/page.tsx
 * 
 * import { CaseLayoutExample } from '../layout-example'
 * 
 * export default function InterrogatePage({ params }: { params: { caseId: string } }) {
 *   const { data: caseData } = useQuery({
 *     queryKey: ['case', params.caseId],
 *     queryFn: () => fetchCase(params.caseId)
 *   })
 * 
 *   if (!caseData) return <div>Loading...</div>
 * 
 *   return (
 *     <CaseLayoutExample
 *       caseId={params.caseId}
 *       caseTitle={caseData.title}
 *       currentStatus={caseData.status}
 *     >
 *       <div className="p-6">
 *         <h1 className="text-2xl font-bold mb-4">Fact Collection</h1>
 *         {/* Your interrogation UI here *\/}
 *       </div>
 *     </CaseLayoutExample>
 *   )
 * }
 * ```
 */
