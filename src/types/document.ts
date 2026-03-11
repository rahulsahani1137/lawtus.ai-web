export interface LegalDocument {
    id: string
    userId: string
    title: string
    fileType: 'pdf' | 'docx' | 'image'
    fileSize: number
    storageKey: string
    extractedText?: string
    pageCount?: number
    isDeleted: boolean
    createdAt: string
}

export interface DocumentUploadResponse {
    documentId: string
    title: string
    fileType: string
    fileSize: number
    pageCount: number | null
    chunkCount: number
    extractedTextPreview: string
}

export interface DocumentAnalysis {
    documentType: string
    parties: string[]
    keyDates: Array<{ date: string; event: string }>
    sectionsInvoked: string[]
    summary: string
    extractedFacts: string[]
}
