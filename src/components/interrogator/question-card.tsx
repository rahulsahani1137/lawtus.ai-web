/**
 * QuestionCard Component
 * Displays a single question with the appropriate answer input
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnswerInput } from './answer-input'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Question } from '@/types/cldi'

interface QuestionCardProps {
  question: Question
  answer: string
  onAnswerChange: (answer: string) => void
  onSubmit: (answer: string) => void
  isLoading?: boolean
  error?: string
  showPrevious?: boolean
  onPrevious?: () => void
}

export function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  isLoading = false,
  error,
  showPrevious = false,
  onPrevious,
}: QuestionCardProps) {
  const [localError, setLocalError] = useState<string>()

  const handleSubmit = () => {
    if (!answer.trim()) {
      setLocalError('Please provide an answer before continuing')
      return
    }
    setLocalError(undefined)
    onSubmit(answer)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{question.question}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Question {question.order}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="mt-1 text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">{question.legalSignificance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium">Your Answer</label>
          <AnswerInput
            questionType={question.questionType}
            value={answer}
            onChange={onAnswerChange}
            disabled={isLoading}
            error={localError || error}
            required
          />
        </div>

        <div className="flex justify-between gap-3 pt-4">
          {showPrevious && onPrevious ? (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !answer.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
