'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { WizardStepper } from '@/app/(main)/drafts/new/_components/wizard-stepper'
import { StepCaseDetails } from '@/app/(main)/drafts/new/_components/step-case-details'
import { StepFactCollection } from '@/app/(main)/drafts/new/_components/step-fact-collection'
import { StepGenerate } from '@/app/(main)/drafts/new/_components/step-generate'
import { Skeleton } from '@/components/ui/skeleton'
import type { CaseType, DraftGenerateInput } from '@/types/draft'

interface CaseDetails {
    caseType: CaseType
    court: string
    clientName: string
    opposingParty: string
    reliefSought: string
    documentIds: string[]
    additionalContext: string
}

function NewDraftWizard() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null)
    const [collectedFacts, setCollectedFacts] = useState('')

    const preselectedType = searchParams.get('type') as CaseType | null
    const preselectedDocId = searchParams.get('docId')

    const handleCaseDetailsComplete = (details: CaseDetails) => {
        setCaseDetails(details)
        setCurrentStep(2)
    }

    const handleFactsComplete = (facts: string) => {
        setCollectedFacts(facts)
        setCurrentStep(3)
    }

    const handleGenerateSuccess = (draftId: string) => {
        router.push(`/drafts/${draftId}`)
    }

    const generateInput: DraftGenerateInput | null = caseDetails
        ? {
            caseType: caseDetails.caseType,
            clientName: caseDetails.clientName,
            opposingParty: caseDetails.opposingParty || undefined,
            court: caseDetails.court,
            reliefSought: caseDetails.reliefSought,
            facts: collectedFacts,
            documentIds:
                caseDetails.documentIds.length > 0
                    ? caseDetails.documentIds
                    : undefined,
            additionalContext: caseDetails.additionalContext || undefined,
        }
        : null

    return (
        <>
            <WizardStepper currentStep={currentStep} />

            {currentStep === 1 && (
                <StepCaseDetails
                    onComplete={handleCaseDetailsComplete}
                    defaultCaseType={preselectedType}
                    defaultDocId={preselectedDocId}
                />
            )}

            {currentStep === 2 && (
                <StepFactCollection
                    caseDetails={caseDetails!}
                    onComplete={handleFactsComplete}
                    onBack={() => setCurrentStep(1)}
                />
            )}

            {currentStep === 3 && generateInput && (
                <StepGenerate
                    input={generateInput}
                    caseDetails={caseDetails!}
                    onSuccess={handleGenerateSuccess}
                    onBack={() => setCurrentStep(2)}
                />
            )}
        </>
    )
}

export default function NewDraftPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Draft</h1>
                <p className="text-muted-foreground mt-1">
                    Create a new legal document in three simple steps
                </p>
            </div>

            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <NewDraftWizard />
            </Suspense>
        </div>
    )
}

