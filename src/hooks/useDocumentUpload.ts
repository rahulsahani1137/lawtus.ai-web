import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface ExtractedDetails {
  dates: string[]
  sections: string[]
  parties: string[]
  documentType: string
  summary: string
}

export interface UploadResult {
  documentId: string
  filename: string
  extractedText: string
  extractedDetails: ExtractedDetails
  ocrConfidence?: number
}

interface UseDocumentUploadOptions {
  caseId: string
  documentType?: 'fir' | 'arrest_memo' | 'court_order' | 'agreement' | 'notice' | 'other'
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
}

export function useDocumentUpload(options: UseDocumentUploadOptions) {
  const { caseId, documentType = 'other', onSuccess, onError } = options
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())

  const uploadDocument = useCallback(
    async (file: File) => {
      const uploadId = `${file.name}-${Date.now()}`

      // Initialize upload progress
      setUploads((prev) => {
        const next = new Map(prev)
        next.set(uploadId, {
          filename: file.name,
          progress: 0,
          status: 'uploading',
        })
        return next
      })

      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file)

        // Update progress to processing
        setUploads((prev) => {
          const next = new Map(prev)
          const current = next.get(uploadId)
          if (current) {
            next.set(uploadId, { ...current, progress: 50, status: 'processing' })
          }
          return next
        })

        // Upload to CLDI Documents API
        const response = await fetch('/api/cldi-documents/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data: base64Data,
            caseId,
            documentType,
            metadata: {
              title: file.name.replace(/\.[^/.]+$/, ''),
            },
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }))
          throw new Error(error.message || 'Upload failed')
        }

        const result: UploadResult = await response.json()

        // Update to complete
        setUploads((prev) => {
          const next = new Map(prev)
          const current = next.get(uploadId)
          if (current) {
            next.set(uploadId, { ...current, progress: 100, status: 'complete' })
          }
          return next
        })

        // Remove from uploads after 2 seconds
        setTimeout(() => {
          setUploads((prev) => {
            const next = new Map(prev)
            next.delete(uploadId)
            return next
          })
        }, 2000)

        toast.success(`${file.name} uploaded successfully`)
        onSuccess?.(result)

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'

        // Update to error state
        setUploads((prev) => {
          const next = new Map(prev)
          const current = next.get(uploadId)
          if (current) {
            next.set(uploadId, {
              ...current,
              status: 'error',
              error: errorMessage,
            })
          }
          return next
        })

        // Remove from uploads after 3 seconds
        setTimeout(() => {
          setUploads((prev) => {
            const next = new Map(prev)
            next.delete(uploadId)
            return next
          })
        }, 3000)

        toast.error(errorMessage)
        onError?.(error instanceof Error ? error : new Error(errorMessage))

        throw error
      }
    },
    [caseId, documentType, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[]) => {
      const results = await Promise.allSettled(files.map((file) => uploadDocument(file)))
      return results
    },
    [uploadDocument]
  )

  return {
    uploadDocument,
    uploadMultiple,
    uploads,
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
