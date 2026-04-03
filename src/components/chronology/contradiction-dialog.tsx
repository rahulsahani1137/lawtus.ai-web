'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Contradiction } from '@/types/cldi'

interface ContradictionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contradictions: Contradiction[]
  onResolve: (contradictionId: string, resolution: string) => Promise<void>
  isLoading?: boolean
}

export function ContradictionDialog({
  open,
  onOpenChange,
  contradictions,
  onResolve,
  isLoading = false,
}: ContradictionDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [resolution, setResolution] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentContradiction = contradictions[currentIndex]
  const hasMore = currentIndex < contradictions.length - 1
  const isLast = currentIndex === contradictions.length - 1

  const handleResolve = async () => {
    if (!resolution.trim()) {
      setErrors({ resolution: 'Please provide a resolution' })
      return
    }

    setIsResolving(true)
    setErrors({})

    try {
      await onResolve(currentContradiction.id, resolution)
      
      // Move to next contradiction or close if last
      if (hasMore) {
        setCurrentIndex(currentIndex + 1)
        setResolution('')
      } else {
        // All contradictions resolved
        setCurrentIndex(0)
        setResolution('')
        onOpenChange(false)
      }
    } finally {
      setIsResolving(false)
    }
  }

  const handleSkip = () => {
    if (hasMore) {
      setCurrentIndex(currentIndex + 1)
      setResolution('')
      setErrors({})
    }
  }

  const handleSelectSource = (source: 'A' | 'B') => {
    const selectedText = source === 'A' 
      ? currentContradiction.sourceA 
      : currentContradiction.sourceB
    setResolution(`Resolved: Using information from Source ${source} - ${selectedText}`)
    setErrors({})
  }

  if (!currentContradiction) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Contradiction Detected</DialogTitle>
          </div>
          <DialogDescription>
            We found {contradictions.length} contradiction{contradictions.length !== 1 ? 's' : ''} in your case facts.
            Please review and resolve {contradictions.length === 1 ? 'it' : 'them'} before proceeding.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Contradiction {currentIndex + 1} of {contradictions.length}
          </span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / contradictions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Contradiction Details */}
        <div className="space-y-4">
          {/* Field in Dispute */}
          <div>
            <Badge variant="outline" className="mb-2">
              {currentContradiction.field}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {currentContradiction.description}
            </p>
          </div>

          {/* Source Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Source A */}
            <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Source A
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectSource('A')}
                    disabled={isResolving || isLoading}
                    className="text-xs"
                  >
                    Use This
                  </Button>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {currentContradiction.sourceA}
                </p>
              </div>
            </Card>

            {/* Source B */}
            <Card className="p-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Source B
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectSource('B')}
                    disabled={isResolving || isLoading}
                    className="text-xs"
                  >
                    Use This
                  </Button>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {currentContradiction.sourceB}
                </p>
              </div>
            </Card>
          </div>

          {/* Resolution Input */}
          <div>
            <label className="text-sm font-medium">
              Your Resolution <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={resolution}
              onChange={(e) => {
                setResolution(e.target.value)
                setErrors({})
              }}
              placeholder="Explain which source is correct and why, or provide the correct information..."
              disabled={isResolving || isLoading}
              className="mt-2 min-h-24"
            />
            {errors.resolution && (
              <p className="text-xs text-destructive mt-1">{errors.resolution}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Click "Use This" on either source to quickly select it, or write your own resolution.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-between pt-4 border-t">
          <div>
            {hasMore && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isResolving || isLoading}
              >
                Skip for Now
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isResolving || isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isResolving || isLoading}
            >
              {isResolving ? (
                'Resolving...'
              ) : isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve & Complete
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve & Next
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
