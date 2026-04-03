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
import { useCases, useDeleteCase } from '@/hooks/use-case-queries'
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

const draftTypeLabels: Record<string, string> = {
    bail: 'Bail Application',
    injunction: 'Civil Injunction',
    writ: 'Writ Petition',
    other: 'Other',
}

const draftTypeColors: Record<string, string> = {
    bail: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    injunction: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    writ: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const statusLabels: Record<string, string> = {
    interrogating: 'Fact Collection',
    chronology: 'Chronology',
    contradiction_found: 'Review Needed',
    drafting: 'Drafting',
    complete: 'Complete',
}

const statusColors: Record<string, string> = {
    interrogating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    chronology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    contradiction_found: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    drafting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export function DraftsTable() {
    const { data, isLoading } = useCases()
    const deleteMutation = useDeleteCase()
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

    const cases = data?.cases || []

    if (cases.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No cases yet</h3>
                <p className="text-sm">
                    Create your first legal document draft to get started.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                    <Link href="/drafts/new">Create Draft</Link>
                </Button>
            </div>
        )
    }

    // Determine the next step URL based on case status
    const getNextStepUrl = (caseItem: typeof cases[0]) => {
        switch (caseItem.status) {
            case 'interrogating':
                return `/drafts/${caseItem.id}/interrogate`
            case 'chronology':
                return `/drafts/${caseItem.id}/chronology`
            case 'contradiction_found':
                return `/drafts/${caseItem.id}/review`
            case 'drafting':
            case 'complete':
                return `/drafts/${caseItem.id}/draft`
            default:
                return `/drafts/${caseItem.id}/interrogate`
        }
    }

    return (
        <>
            <div className="space-y-2">
                {cases.map((caseItem) => (
                    <Link
                        key={caseItem.id}
                        href={getNextStepUrl(caseItem)}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                        <Badge
                            className={cn(
                                'text-xs font-medium shrink-0',
                                draftTypeColors[caseItem.draftType] || draftTypeColors.other,
                            )}
                        >
                            {draftTypeLabels[caseItem.draftType] || 'Other'}
                        </Badge>
                        <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
                            {caseItem.title}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-xs shrink-0 hidden sm:inline-flex',
                                statusColors[caseItem.status],
                            )}
                        >
                            {statusLabels[caseItem.status] || caseItem.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(caseItem.updatedAt)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDeleteId(caseItem.id)
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
                        <DialogTitle>Delete Case</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this case? This action cannot
                            be undone. All associated data will be permanently removed.
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
