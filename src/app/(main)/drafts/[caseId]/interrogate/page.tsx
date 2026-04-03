'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuestionCard } from '@/components/interrogator/question-card'
import { ArrowRight, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useInterrogator } from '@/hooks/useInterrogator'

export default function InterrogatePage({
    params,
}: {
    params: Promise<{ caseId: string }>
}) {
    const { caseId } = use(params)
    const router = useRouter()
    
    // Local state for current answer
    const [currentAnswer, setCurrentAnswer] = useState('')
    
    // Interrogator hook
    const interrogator = useInterrogator({ caseId })
    
    // Auto-start interrogation if no questions exist
    useEffect(() => {
        if (!interrogator.isLoading && interrogator.totalCount === 0 && !interrogator.isStarting) {
            interrogator.startInterrogation()
        }
    }, [interrogator.isLoading, interrogator.totalCount, interrogator.isStarting])
    
    // Reset answer when question changes
    useEffect(() => {
        if (interrogator.currentQuestion) {
            setCurrentAnswer(interrogator.currentQuestion.answer || '')
        }
    }, [interrogator.currentQuestionIndex, interrogator.currentQuestion])
    
    // Handle answer submission
    const handleSubmitAnswer = async (answer: string) => {
        if (!interrogator.currentQuestion) return
        
        await interrogator.answerQuestion(interrogator.currentQuestion.id, answer)
        setCurrentAnswer('') // Reset for next question
    }
    
    // Handle skip
    const handleSkip = () => {
        if (!interrogator.currentQuestion) return
        
        interrogator.skipQuestion(interrogator.currentQuestion.id)
        setCurrentAnswer('')
    }
    
    // Handle complete interrogation
    const handleComplete = () => {
        router.push(`/drafts/${caseId}/chronology`)
    }
    
    // Loading state
    if (interrogator.isLoading || interrogator.isStarting) {
        return (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <CLDIBreadcrumb caseId={caseId} />
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">
                                {interrogator.isStarting ? 'Starting interrogation...' : 'Loading questions...'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    // No questions state
    if (interrogator.totalCount === 0) {
        return (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <CLDIBreadcrumb caseId={caseId} />
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                            <p className="text-muted-foreground">
                                No questions available. Please try again.
                            </p>
                            <Button onClick={() => interrogator.startInterrogation()}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <CLDIBreadcrumb caseId={caseId} />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fact Collection</h1>
                <p className="text-muted-foreground mt-1">
                    Answer questions to help us understand your case
                </p>
            </div>
            
            {/* Progress Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Question {interrogator.currentQuestionIndex + 1} of {interrogator.totalCount}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {interrogator.completionPercentage}% Complete
                        </div>
                    </div>
                    <Progress value={interrogator.completionPercentage} className="mt-2" />
                </CardHeader>
            </Card>
            
            {/* Completion Warning */}
            {interrogator.completionPercentage < 80 && interrogator.completionPercentage > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        We recommend answering at least 80% of questions for a comprehensive draft.
                        Current progress: {interrogator.completionPercentage}%
                    </AlertDescription>
                </Alert>
            )}
            
            {/* Current Question */}
            {interrogator.currentQuestion && (
                <QuestionCard
                    question={interrogator.currentQuestion}
                    answer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    onSubmit={handleSubmitAnswer}
                    isLoading={interrogator.isAnswering}
                    showPrevious={interrogator.canGoPrevious}
                    onPrevious={interrogator.previousQuestion}
                />
            )}
            
            {/* Answered Questions Summary Sidebar */}
            {interrogator.answeredCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Answered Questions ({interrogator.answeredCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {interrogator.questions
                                .filter(q => q.isAnswered)
                                .map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => interrogator.goToQuestion(interrogator.questions.indexOf(q))}
                                        className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <p className="text-sm font-medium line-clamp-1">{q.question}</p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                            {q.answer}
                                        </p>
                                    </button>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {/* Skip & Complete Actions */}
            <div className="flex justify-between items-center pt-4">
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={interrogator.isAnswering || !interrogator.currentQuestion}
                >
                    Skip Question
                </Button>
                
                {interrogator.isComplete || interrogator.completionPercentage >= 80 ? (
                    <Button
                        size="lg"
                        onClick={handleComplete}
                        disabled={interrogator.isAnswering}
                    >
                        Complete Interrogation
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : null}
            </div>
        </div>
    )
}

