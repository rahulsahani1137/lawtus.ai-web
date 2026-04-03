'use client'

import { FileText, MessageSquare, FolderOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDraftsList } from '@/hooks/use-draft-queries'
import { useDocumentsList } from '@/hooks/use-document-queries'
import { useChatSessions } from '@/hooks/use-chat-queries'

const stats = [
    { key: 'drafts', label: 'Total Drafts', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'chats', label: 'Active Chats', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'documents', label: 'Documents', icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
] as const

export function StatsBlock() {
    const { data: drafts, isLoading: draftsLoading } = useDraftsList()
    const { data: sessions, isLoading: chatsLoading } = useChatSessions()
    const { data: documents, isLoading: docsLoading } = useDocumentsList()

    const isLoading = draftsLoading || chatsLoading || docsLoading

    const counts: Record<string, number> = {
        drafts: drafts?.length ?? 0,
        chats: sessions?.length ?? 0,
        documents: documents?.length ?? 0,
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.key} className="shadow-none border border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex bg-muted/50 items-center justify-center p-2 rounded-md border border-border">
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            {isLoading ? (
                                <Skeleton className="h-6 w-12 mt-1" />
                            ) : (
                                <p className="text-xl font-semibold mt-0.5">{counts[stat.key]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
