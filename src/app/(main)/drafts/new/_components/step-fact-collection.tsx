'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestionCard } from '@/components/interrogator/question-card'
import { ProgressIndicator } from '@/components/interrogator/progress-indicator'
import { useInterrogator } from '@/hooks/useInterrogator'
import type { DraftType } from '@/types/cldi'
import type { CaseType } from '@/types/draft'

interface StepFactCollectionProps {
    caseId: string
    caseDetails: {
        caseType: CaseType
        court: string
        clientName: string
    }
    rawFacts: string
    onComplete: () => void
    onBack: () => void
}

// Map CaseType to DraftType
function mapCaseTypeToDraftType(caseType: CaseType): DraftType {
    const mapping: Record<CaseType, DraftType> = {
        bail_application: 'bail',
        civil_injunction: 'injunction',
        writ_petition: 'writ',
        complaint: 'other',
        reply: 'other',
        vakalatnama: 'other',
        written_statement: 'other',
    }
    return mapping[caseType] || 'other'
}

export function StepFactCollection({
    caseId,
    caseDetails,
    rawFacts,
    onComplete,
    onBack,
}: StepFactCollectionProps) {
    const draftType = mapCaseTypeToDraftType(caseDetails.caseType)
    const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({})

    const {
        state,
        startInterrogation,
        answerCurrentQuestion,
        goToPreviousQuestion,
        goToNextQuestion,
        getCompletionPercentage,
    } = useInterrogator({
        caseId,
        draftType,
        rawFacts,
    })

    // Start interrogation on mount
    useEffect(() => {
        startInterrogation()
    }, [startInterrogation])

    const currentQuestion = state.questions[state.currentQuestionIndex]
    const currentAnswer = currentQuestion
        ? localAnswers[currentQuestion.id] || ''
        : ''
    const completionPercentage = getCompletionPercentage()
    const isComplete = completionPercentage >= 80

    const handleAnswerChange = (answer: string) => {
        if (currentQuestion) {
            setLocalAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: answer,
            }))
        }
    }

    const handleAnswerSubmit = async (answer: string) => {
        await answerCurrentQuestion(answer)
        // Auto-advance to next question if available
        if (state.currentQuestionIndex < state.questions.length - 1) {
            goToNextQuestion()
        }
    }

    if (state.isLoading && state.questions.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">
                                Preparing questions...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (state.error) {
        return (
            <div className="space-y-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex items-center gap-3 py-4">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-red-900">Error</p>
                            <p className="text-sm text-red-700">{state.error}</p>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={() => startInterrogation()}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    if (!currentQuestion) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No questions available
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fact Collection Wizard</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Answer the following questions to help us understand your case better.
                        Your answers will be used to generate a comprehensive legal document.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProgressIndicator
                        currentQuestion={state.currentQuestionIndex + 1}
                        totalQuestions={state.questions.length}
                        completionPercentage={completionPercentage}
                    />

                    <QuestionCard
                        question={currentQuestion}
                        answer={currentAnswer}
                        onAnswerChange={handleAnswerChange}
                        onSubmit={handleAnswerSubmit}
                        isLoading={state.isLoading}
                        error={state.error}
                        showPrevious={state.currentQuestionIndex > 0}
                        onPrevious={goToPreviousQuestion}
                    />

                    {!isComplete && completionPercentage > 0 && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            <p className="font-medium">
                                {100 - completionPercentage}% more questions to go
                            </p>
                            <p className="text-xs text-amber-700">
                                We recommend answering at least 80% of questions for best results.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between border-t pt-6">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            onClick={onComplete}
                            disabled={!isComplete}
                            className="min-w-[150px]"
                        >
                            {isComplete
                                ? 'Complete & Continue'
                                : `Complete (${completionPercentage}%)`}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
