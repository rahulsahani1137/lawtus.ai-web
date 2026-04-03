'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDocumentUpload, type ExtractedDetails } from '@/hooks/useDocumentUpload'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface DocumentUploadZoneProps {
  caseId: string
  documentType?: 'fir' | 'arrest_memo' | 'court_order' | 'agreement' | 'notice' | 'other'
  onUploadComplete?: (result: {
    documentId: string
    filename: string
    extractedText: string
    extractedDetails: ExtractedDetails
    ocrConfidence?: number
  }) => void
  className?: string
}

export function DocumentUploadZone({
  caseId,
  documentType = 'other',
  onUploadComplete,
  className,
}: DocumentUploadZoneProps) {
  const { uploadDocument, uploads } = useDocumentUpload({
    caseId,
    documentType,
    onSuccess: onUploadComplete,
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        uploadDocument(file)
      }
    },
    [uploadDocument]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'p-8 border-2 border-dashed rounded-t-lg cursor-pointer transition-all text-center',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground shrink-0" />
          <p className="text-base font-medium mb-2">
            {isDragActive ? 'Drop files here...' : 'Drag & drop documents here'}
          </p>
          <p className="text-sm text-muted-foreground mb-1">or click to browse</p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, JPEG, PNG, TIFF (max 10MB)
          </p>
        </div>

        {/* File Rejections */}
        {fileRejections.length > 0 && (
          <div className="p-4 border-t bg-destructive/5">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="flex items-start gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  {errors.map((error) => (
                    <p key={error.code} className="text-xs">
                      {error.message}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploads.size > 0 && (
          <div className="p-4 space-y-3 border-t">
            {Array.from(uploads.entries()).map(([id, upload]) => (
              <UploadItem key={id} upload={upload} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface UploadItemProps {
  upload: {
    filename: string
    progress: number
    status: 'uploading' | 'processing' | 'complete' | 'error'
    error?: string
  }
}

function UploadItem({ upload }: UploadItemProps) {
  const { filename, progress, status, error } = upload

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {status === 'uploading' && (
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
        )}
        {status === 'processing' && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
        )}
        {status === 'complete' && (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        )}
        {status === 'error' && <XCircle className="h-4 w-4 text-destructive shrink-0" />}

        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{filename}</p>
          {status === 'uploading' && (
            <p className="text-xs text-muted-foreground">Uploading...</p>
          )}
          {status === 'processing' && (
            <p className="text-xs text-muted-foreground">Processing document...</p>
          )}
          {status === 'complete' && (
            <p className="text-xs text-green-600">Upload complete</p>
          )}
          {status === 'error' && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {status !== 'error' && (
          <Badge variant={status === 'complete' ? 'default' : 'secondary'} className="ml-2">
            {progress}%
          </Badge>
        )}
      </div>

      {status !== 'complete' && status !== 'error' && (
        <Progress value={progress} className="h-1" />
      )}
    </div>
  )
}

interface ExtractedDetailsDisplayProps {
  details: ExtractedDetails
  ocrConfidence?: number
}

export function ExtractedDetailsDisplay({
  details,
  ocrConfidence,
}: ExtractedDetailsDisplayProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Extracted Details</h3>
          {ocrConfidence !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">OCR Confidence:</span>
              <Badge variant={ocrConfidence > 0.8 ? 'default' : 'secondary'}>
                {Math.round(ocrConfidence * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {details.documentType && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Document Type</p>
            <Badge variant="outline">{details.documentType}</Badge>
          </div>
        )}

        {details.dates.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Dates Found</p>
            <div className="flex flex-wrap gap-1">
              {details.dates.map((date, i) => (
                <Badge key={i} variant="secondary">
                  {date}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {details.sections.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Sections Invoked</p>
            <div className="flex flex-wrap gap-1">
              {details.sections.map((section, i) => (
                <Badge key={i} variant="secondary">
                  {section}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {details.parties.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Parties</p>
            <div className="flex flex-wrap gap-1">
              {details.parties.map((party, i) => (
                <Badge key={i} variant="secondary">
                  {party}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {details.summary && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
            <p className="text-sm text-muted-foreground">{details.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
