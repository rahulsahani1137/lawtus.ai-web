'use client'

import Link from 'next/link'
import { FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useDraftsList, useDeleteDraft } from '@/hooks/use-draft-queries'
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

export function DraftsTable() {
    const { data: drafts, isLoading } = useDraftsList()
    const deleteMutation = useDeleteDraft()
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        )
    }

    if (!drafts || drafts.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No drafts yet</h3>
                <p className="text-sm">
                    Create your first legal document draft to get started.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                    <Link href="/drafts/new">Create Draft</Link>
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-2">
                {drafts.map((draft) => (
                    <Link
                        key={draft.id}
                        href={`/drafts/${draft.id}`}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
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
                        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                            {draft.court}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(draft.updatedAt)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDeleteId(draft.id)
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                    </Link>
                ))}
            </div>

            <Dialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Draft</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this draft? This action cannot
                            be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
