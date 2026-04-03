'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, CheckCircle2 } from 'lucide-react'
import type { ChronologyEvent } from '@/types/cldi'
import { EventCard } from './event-card'
import { AddEventDialog } from './add-event-dialog'

interface ChronologyTimelineProps {
  caseId: string
  events: ChronologyEvent[]
  onAddEvent: (event: Omit<ChronologyEvent, 'id' | 'createdAt'>) => Promise<void>
  onEditEvent: (id: string, updates: Partial<ChronologyEvent>) => Promise<void>
  onDeleteEvent: (id: string) => Promise<void>
  onVerify: () => Promise<void>
  isLoading?: boolean
}

export function ChronologyTimeline({
  caseId,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onVerify,
  isLoading = false,
}: ChronologyTimelineProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      await onVerify()
    } finally {
      setIsVerifying(false)
    }
  }

  const eventTypeColors: Record<string, { bg: string; border: string; dot: string }> = {
    evidence: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
    },
    procedural: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
    },
    adverse: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    },
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-900',
      border: 'border-gray-200 dark:border-gray-700',
      dot: 'bg-gray-500',
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Chronological Timeline</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} • Organized chronologically
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={isLoading || isVerifying || events.length === 0}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Verify
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Evidence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Procedural</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>Adverse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
          <span>Neutral</span>
        </div>
      </div>

      {/* Timeline */}
      {sortedEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No events yet. Add your first event to get started.</p>
        </Card>
      ) : (
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Events */}
          {sortedEvents.map((event, index) => {
            const colors = eventTypeColors[event.eventType] || eventTypeColors.neutral
            return (
              <div key={event.id} className="relative pl-16">
                {/* Dot */}
                <div className={`absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-background ${colors.dot}`} />

                {/* Event Card */}
                <EventCard
                  event={event}
                  colors={colors}
                  isEditing={editingEventId === event.id}
                  onEdit={() => setEditingEventId(event.id)}
                  onSave={async (updates) => {
                    await onEditEvent(event.id, updates)
                    setEditingEventId(null)
                  }}
                  onCancel={() => setEditingEventId(null)}
                  onDelete={() => onDeleteEvent(event.id)}
                  isLoading={isLoading}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={async (event) => {
          await onAddEvent(event)
          setIsAddDialogOpen(false)
        }}
        isLoading={isLoading}
      />
    </div>
  )
}
