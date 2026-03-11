'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeleteChatSession } from '@/hooks/use-chat-queries'
import type { ChatSession } from '@/types/chat'
import { cn } from '@/lib/utils'

const MODE_STYLES = {
    draft: 'bg-blue-100 text-blue-800',
    research: 'bg-green-100 text-green-800',
    interrogate: 'bg-amber-100 text-amber-800',
} as const

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function SessionCard({ session }: { session: ChatSession }) {
    const router = useRouter()
    const deleteMutation = useDeleteChatSession()

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteMutation.mutate(session.id)
    }

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group"
            onClick={() => router.push(`/chat/${session.id}`)}
        >
            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-base font-medium truncate flex-1">
                    {session.title || 'Untitled Chat'}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <Badge className={cn('text-xs font-medium', MODE_STYLES[session.mode])}>
                    {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {timeAgo(session.updatedAt)}
                </span>
            </CardContent>
        </Card>
    )
}
