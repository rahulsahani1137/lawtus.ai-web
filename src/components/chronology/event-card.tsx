'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit2, Trash2, X, Check } from 'lucide-react'
import type { ChronologyEvent, EventType } from '@/types/cldi'

interface EventCardProps {
  event: ChronologyEvent
  colors: { bg: string; border: string; dot: string }
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<ChronologyEvent>) => Promise<void>
  onCancel: () => void
  onDelete: () => Promise<void>
  isLoading?: boolean
}

export function EventCard({
  event,
  colors,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isLoading = false,
}: EventCardProps) {
  const [editData, setEditData] = useState<Partial<ChronologyEvent>>(event)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editData)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const eventTypeLabel: Record<EventType, string> = {
    evidence: 'Evidence',
    procedural: 'Procedural',
    adverse: 'Adverse',
    neutral: 'Neutral',
  }

  if (isEditing) {
    return (
      <Card className={`p-4 border-2 ${colors.border} ${colors.bg}`}>
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <Input
              type="date"
              value={editData.date || ''}
              onChange={(e) => setEditData({ ...editData, date: e.target.value || undefined })}
              disabled={isSaving || isLoading}
              className="mt-1"
            />
          </div>

          {/* Date Raw */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date Reference</label>
            <Input
              value={editData.dateRaw || ''}
              onChange={(e) => setEditData({ ...editData, dateRaw: e.target.value })}
              placeholder="e.g., 'January 15, 2025' or 'Day of arrest'"
              disabled={isSaving || isLoading}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="What happened?"
              disabled={isSaving || isLoading}
              className="mt-1 min-h-20"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Event Type</label>
            <Select
              value={editData.eventType || 'neutral'}
              onValueChange={(value) => setEditData({ ...editData, eventType: value as EventType })}
              disabled={isSaving || isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="procedural">Procedural</SelectItem>
                <SelectItem value="adverse">Adverse</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Document */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Source Document</label>
            <Input
              value={editData.source || ''}
              onChange={(e) => setEditData({ ...editData, source: e.target.value || undefined })}
              placeholder="e.g., 'FIR #2025-001'"
              disabled={isSaving || isLoading}
              className="mt-1"
            />
          </div>

          {/* Legal Relevance */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Legal Relevance</label>
            <Textarea
              value={editData.legalRelevance || ''}
              onChange={(e) => setEditData({ ...editData, legalRelevance: e.target.value || undefined })}
              placeholder="Why is this event legally significant?"
              disabled={isSaving || isLoading}
              className="mt-1 min-h-16"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving || isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card
        className={`p-4 border-2 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onEdit}
      >
        <div className="space-y-2">
          {/* Header with date and type */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {event.date && (
                <div className="text-xs font-semibold text-foreground">
                  {new Date(event.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
              {event.dateRaw && !event.date && (
                <div className="text-xs text-muted-foreground italic">{event.dateRaw}</div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {eventTypeLabel[event.eventType]}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm font-medium leading-snug">{event.description}</p>

          {/* Legal Relevance */}
          {event.legalRelevance && (
            <p className="text-xs text-muted-foreground italic">{event.legalRelevance}</p>
          )}

          {/* Source Document */}
          {event.source && (
            <div className="text-xs text-muted-foreground pt-1 border-t border-current border-opacity-10">
              <span className="font-medium">Source:</span> {event.source}
            </div>
          )}

          {/* Verification Status */}
          {event.isVerified && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium pt-1">
              ✓ Verified
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The event will be permanently removed from the timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
