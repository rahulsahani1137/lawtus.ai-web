'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import type { ChronologyEvent } from '@/types/draft'

export function ChronologyTab({
    chronology,
}: {
    chronology: ChronologyEvent[]
}) {
    if (chronology.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chronology available.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
                Timeline of Events
            </h3>
            <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
                {chronology.map((event, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                                {event.date}
                            </Badge>
                            <p className="text-sm font-medium">{event.event}</p>
                            <p className="text-xs text-muted-foreground">
                                {event.legalRelevance}
                            </p>
                            {event.documentRef && (
                                <p className="text-xs italic text-muted-foreground">
                                    Ref: {event.documentRef}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
