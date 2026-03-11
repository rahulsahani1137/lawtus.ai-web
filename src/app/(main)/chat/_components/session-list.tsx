'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'
import { useChatSessions } from '@/hooks/use-chat-queries'
import { SessionCard } from '@/app/(main)/chat/_components/session-card'

export function SessionList() {
    const { data: sessions, isLoading } = useChatSessions()

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3 p-4 border rounded-lg">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        )
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No chat sessions yet</h3>
                <p className="text-sm">
                    Start a new chat to begin your legal research
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
            ))}
        </div>
    )
}
