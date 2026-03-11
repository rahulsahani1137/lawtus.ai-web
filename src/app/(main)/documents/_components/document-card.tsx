'use client'

import { useState } from 'react'
import { FileText, Image, MoreVertical, Search, Trash2, FileInput } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteDocument, useAnalyzeDocument } from '@/hooks/use-document-queries'
import { AnalyzeSheet } from '@/app/(main)/documents/_components/analyze-sheet'
import type { LegalDocument, DocumentAnalysis } from '@/types/document'
import { useRouter } from 'next/navigation'

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentCard({ document: doc }: { document: LegalDocument }) {
    const router = useRouter()
    const deleteMutation = useDeleteDocument()
    const analyzeMutation = useAnalyzeDocument()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [analyzeOpen, setAnalyzeOpen] = useState(false)
    const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)

    const handleAnalyze = async () => {
        const result = await analyzeMutation.mutateAsync(doc.id)
        setAnalysis(result.analysis)
        setAnalyzeOpen(true)
    }

    const handleDelete = () => {
        deleteMutation.mutate(doc.id)
        setDeleteOpen(false)
    }

    return (
        <>
            <Card className="group transition-all hover:shadow-md">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-muted shrink-0">
                            {doc.fileType === 'image' ? (
                                <Image className="h-5 w-5 text-green-600" />
                            ) : (
                                <FileText className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatSize(doc.fileSize)}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleAnalyze}
                                disabled={analyzeMutation.isPending}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Analyze
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.push(`/drafts/new?docId=${doc.id}`)}
                            >
                                <FileInput className="mr-2 h-4 w-4" />
                                Use in Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                        {doc.fileType.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {doc.pageCount && <span>{doc.pageCount} pages</span>}
                        <span>{timeAgo(doc.createdAt)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{doc.title}&quot;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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

            {/* Analyze Sheet */}
            <AnalyzeSheet
                open={analyzeOpen}
                onOpenChange={setAnalyzeOpen}
                analysis={analysis}
                title={doc.title}
                isLoading={analyzeMutation.isPending}
            />
        </>
    )
}
