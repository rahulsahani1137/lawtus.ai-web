/**
 * ProgressIndicator Component
 * Shows progress through the interrogation
 */

'use client'

interface ProgressIndicatorProps {
  currentQuestion: number
  totalQuestions: number
  completionPercentage: number
}

export function ProgressIndicator({
  currentQuestion,
  totalQuestions,
  completionPercentage,
}: ProgressIndicatorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Question {currentQuestion} of {totalQuestions}
          </p>
          <p className="text-xs text-muted-foreground">
            {completionPercentage}% complete
          </p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  )
}
