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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ChronologyEvent, EventType } from '@/types/cldi'

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (event: Omit<ChronologyEvent, 'id' | 'createdAt'>) => Promise<void>
  isLoading?: boolean
}

export function AddEventDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading = false,
}: AddEventDialogProps) {
  const [formData, setFormData] = useState<Omit<ChronologyEvent, 'id' | 'createdAt'>>({
    date: null,
    dateRaw: '',
    description: '',
    source: null,
    legalRelevance: null,
    eventType: 'neutral',
    isVerified: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dateRaw || !formData.dateRaw.trim()) {
      newErrors.dateRaw = 'Date reference is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      // Reset form
      setFormData({
        date: null,
        dateRaw: '',
        description: '',
        source: null,
        legalRelevance: null,
        eventType: 'neutral',
        isVerified: false,
      })
      setErrors({})
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Event to Timeline</DialogTitle>
          <DialogDescription>
            Add a new chronological event to your case timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="text-sm font-medium">Date (Optional)</label>
            <Input
              type="date"
              value={formData.date || ''}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value || null })
              }
              disabled={isSubmitting || isLoading}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank if exact date is uncertain
            </p>
          </div>

          {/* Date Raw */}
          <div>
            <label className="text-sm font-medium">
              Date Reference <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.dateRaw || ''}
              onChange={(e) => setFormData({ ...formData, dateRaw: e.target.value })}
              placeholder="e.g., 'January 15, 2025' or 'Day of arrest' or 'As per FIR'"
              disabled={isSubmitting || isLoading}
              className="mt-1"
            />
            {errors.dateRaw && (
              <p className="text-xs text-destructive mt-1">{errors.dateRaw}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What happened? Be specific and factual."
              disabled={isSubmitting || isLoading}
              className="mt-1 min-h-24"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="text-sm font-medium">Event Type</label>
            <Select
              value={formData.eventType}
              onValueChange={(value) =>
                setFormData({ ...formData, eventType: value as EventType })
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evidence">Evidence - Supports your case</SelectItem>
                <SelectItem value="procedural">Procedural - Court/legal process</SelectItem>
                <SelectItem value="adverse">Adverse - Supports opposing party</SelectItem>
                <SelectItem value="neutral">Neutral - Factual but not directly relevant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Document */}
          <div>
            <label className="text-sm font-medium">Source Document (Optional)</label>
            <Input
              value={formData.source || ''}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value || null })
              }
              placeholder="e.g., 'FIR #2025-001', 'Court Order dated 15-Jan-2025'"
              disabled={isSubmitting || isLoading}
              className="mt-1"
            />
          </div>

          {/* Legal Relevance */}
          <div>
            <label className="text-sm font-medium">Legal Relevance (Optional)</label>
            <Textarea
              value={formData.legalRelevance || ''}
              onChange={(e) =>
                setFormData({ ...formData, legalRelevance: e.target.value || null })
              }
              placeholder="Why is this event legally significant? How does it support your case?"
              disabled={isSubmitting || isLoading}
              className="mt-1 min-h-20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
