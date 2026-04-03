'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useDraftsList } from '@/hooks/use-draft-queries'
import { CASE_TYPE_LABELS, CASE_TYPE_COLORS } from '@/types/draft'
import { cn } from '@/lib/utils'

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function RecentDrafts() {
    const { data: drafts, isLoading } = useDraftsList()

    const recentDrafts = drafts?.slice(0, 5) ?? []

    return (
        <Card className="shadow-none border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Recent Drafts</CardTitle>
                    <CardDescription>Your latest legal documents</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/drafts">View all</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                ) : recentDrafts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No drafts yet. Create your first one!</p>
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                            <Link href="/drafts/new">New Draft</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentDrafts.map((draft) => (
                            <Link
                                key={draft.id}
                                href={`/drafts/${draft.id}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <Badge
                                    className={cn(
                                        'text-xs font-medium shrink-0',
                                        CASE_TYPE_COLORS[draft.caseType],
                                    )}
                                >
                                    {CASE_TYPE_LABELS[draft.caseType]}
                                </Badge>
                                <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
                                    {draft.title}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {draft.court}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {timeAgo(draft.updatedAt)}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
