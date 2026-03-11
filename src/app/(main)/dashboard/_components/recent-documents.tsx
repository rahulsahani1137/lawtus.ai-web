'use client'

import Link from 'next/link'
import { FileText, Image, FolderOpen } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentsList } from '@/hooks/use-document-queries'

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

function FileTypeIcon({ type }: { type: string }) {
    if (type === 'image') return <Image className="h-4 w-4 text-green-600" />
    return <FileText className="h-4 w-4 text-blue-600" />
}

export function RecentDocuments() {
    const { data: documents, isLoading } = useDocumentsList()

    const recentDocs = documents?.slice(0, 3) ?? []

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Recent Documents</CardTitle>
                    <CardDescription>Uploaded files</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents">View all</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        ))}
                    </div>
                ) : recentDocs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents yet.</p>
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                            <Link href="/documents">Upload</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentDocs.map((doc) => (
                            <Link
                                key={doc.id}
                                href="/documents"
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-muted">
                                    <FileTypeIcon type={doc.fileType} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {doc.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {timeAgo(doc.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
