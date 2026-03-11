'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { FolderOpen } from 'lucide-react'
import { useDocumentsList } from '@/hooks/use-document-queries'
import { DocumentCard } from '@/app/(main)/documents/_components/document-card'

export function DocumentsGrid() {
    const { data: documents, isLoading } = useDocumentsList()

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        )
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No documents yet</h3>
                <p className="text-sm">
                    Upload your first legal document to get started.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
            ))}
        </div>
    )
}
