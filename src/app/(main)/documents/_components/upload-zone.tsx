'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileUp, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useUploadDocument } from '@/hooks/use-document-queries'
import { useUploadingFiles } from '@/stores/documents'
import { cn } from '@/lib/utils'

const ACCEPTED = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
}

export function UploadZone() {
    const uploadMutation = useUploadDocument()
    const uploadingFiles = useUploadingFiles()

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            for (const file of acceptedFiles) {
                const tempId = `${file.name}-${Date.now()}`
                const title = file.name.replace(/\.[^/.]+$/, '')
                uploadMutation.mutate({ file, title, tempId })
            }
        },
        [uploadMutation],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED,
        maxSize: 10 * 1024 * 1024, // 10MB
    })

    return (
        <Card>
            <CardContent className="p-0">
                <div
                    {...getRootProps()}
                    className={cn(
                        'p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all text-center',
                        isDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50',
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">
                        {isDragActive
                            ? 'Drop files here...'
                            : 'Drag & drop files here, or click to select'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOCX, JPEG, PNG (max 10MB)
                    </p>
                </div>

                {uploadingFiles.size > 0 && (
                    <div className="p-4 space-y-2 border-t">
                        {Array.from(uploadingFiles.entries()).map(([id, file]) => (
                            <div
                                key={id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <FileUp className="h-4 w-4" />
                                <span className="truncate">{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
