import { apiFetch, apiUpload } from '@/lib/api'
import type {
    LegalDocument,
    DocumentUploadResponse,
    DocumentAnalysis,
} from '@/types/document'

export const uploadDocument = (form: FormData) =>
    apiUpload<DocumentUploadResponse>('/documents/upload', form)

export const getDocuments = () =>
    apiFetch<{ documents: LegalDocument[] }>('/documents')

export const getDocument = (id: string) =>
    apiFetch<{ document: LegalDocument }>(`/documents/${id}`)

export const analyzeDocument = (id: string) =>
    apiFetch<{
        documentId: string
        title: string
        analysis: DocumentAnalysis
    }>(`/documents/${id}/analyze`, { method: 'POST' })

export const deleteDocument = (id: string) =>
    apiFetch<{ success: boolean; message: string }>(
        `/documents/${id}`,
        { method: 'DELETE' },
    )
