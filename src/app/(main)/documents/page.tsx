'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadZone } from '@/app/(main)/documents/_components/upload-zone'
import { DocumentsGrid } from '@/app/(main)/documents/_components/documents-grid'

export default function DocumentsPage() {
    const [showUpload, setShowUpload] = useState(false)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground mt-1">
                        Upload and manage your legal documents
                    </p>
                </div>
                <Button onClick={() => setShowUpload((v) => !v)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                </Button>
            </div>

            {showUpload && <UploadZone />}

            <DocumentsGrid />
        </div>
    )
}
