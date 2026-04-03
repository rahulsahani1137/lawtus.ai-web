'use client'

import { useState } from 'react'
import { DocumentUploadZone, ExtractedDetailsDisplay } from './upload-zone'
import type { ExtractedDetails } from '@/hooks/useDocumentUpload'

interface UploadedDocument {
  documentId: string
  filename: string
  extractedText: string
  extractedDetails: ExtractedDetails
  ocrConfidence?: number
}

interface DocumentUploadZoneExampleProps {
  caseId: string
  documentType?: 'fir' | 'arrest_memo' | 'court_order' | 'agreement' | 'notice' | 'other'
}

export function DocumentUploadZoneExample({
  caseId,
  documentType,
}: DocumentUploadZoneExampleProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])

  const handleUploadComplete = (result: UploadedDocument) => {
    setUploadedDocuments((prev) => [...prev, result])
  }

  return (
    <div className="space-y-6">
      <DocumentUploadZone
        caseId={caseId}
        documentType={documentType}
        onUploadComplete={handleUploadComplete}
      />

      {uploadedDocuments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Documents</h3>
          {uploadedDocuments.map((doc) => (
            <div key={doc.documentId} className="space-y-2">
              <h4 className="text-sm font-medium">{doc.filename}</h4>
              <ExtractedDetailsDisplay
                details={doc.extractedDetails}
                ocrConfidence={doc.ocrConfidence}
              />
              {doc.extractedText && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View extracted text
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                    {doc.extractedText}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
