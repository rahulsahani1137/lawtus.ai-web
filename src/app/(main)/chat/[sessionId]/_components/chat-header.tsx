'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ChatSession } from '@/types/chat'
import { cn } from '@/lib/utils'

const MODE_STYLES = {
    draft: 'bg-blue-100 text-blue-800',
    research: 'bg-green-100 text-green-800',
    interrogate: 'bg-amber-100 text-amber-800',
} as const

export function ChatHeader({
    session,
}: {
    session: ChatSession | null
}) {
    const router = useRouter()

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push('/chat')}
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium truncate">
                    {session?.title || 'Chat'}
                </h2>
            </div>
            {session?.mode && (
                <Badge className={cn('text-xs', MODE_STYLES[session.mode])}>
                    {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}
                </Badge>
            )}
        </div>
    )
}
