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
                <Card key={stat.key}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            {isLoading ? (
                                <Skeleton className="h-7 w-12 mt-1" />
                            ) : (
                                <p className="text-2xl font-bold">{counts[stat.key]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
