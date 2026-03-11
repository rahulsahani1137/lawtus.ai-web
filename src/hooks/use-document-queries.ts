'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getDocuments,
    getDocument,
    uploadDocument,
    analyzeDocument,
    deleteDocument,
} from '@/lib/requests/documents'
import { DocumentStoreActions } from '@/stores/documents'
import type { LegalDocument } from '@/types/document'

export const documentKeys = {
    all: ['documents'] as const,
    list: () => [...documentKeys.all, 'list'] as const,
    detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
}

export function useDocumentsList() {
    return useQuery({
        queryKey: documentKeys.list(),
        queryFn: async () => {
            const { documents } = await getDocuments()
            return documents
        },
    })
}

export function useDocumentDetail(id: string | undefined) {
    return useQuery({
        queryKey: documentKeys.detail(id ?? ''),
        queryFn: async () => {
            if (!id) return null
            const { document } = await getDocument(id)
            return document
        },
        enabled: !!id,
    })
}

export function useUploadDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            file,
            title,
            tempId,
        }: {
            file: File
            title?: string
            tempId: string
        }) => {
            DocumentStoreActions.setUploading(tempId, {
                name: file.name,
                progress: 0,
            })

            const form = new FormData()
            form.append('file', file)
            if (title) form.append('title', title)

            const response = await uploadDocument(form)
            return { response, tempId }
        },
        onSuccess: ({ tempId }) => {
            DocumentStoreActions.setUploading(tempId, null)
            queryClient.invalidateQueries({ queryKey: documentKeys.list() })
            toast.success('Document uploaded successfully')
        },
        onError: (error, { tempId }) => {
            DocumentStoreActions.setUploading(tempId, null)
            toast.error(error.message || 'Upload failed')
        },
    })
}

export function useAnalyzeDocument() {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await analyzeDocument(id)
            return result
        },
        onError: (error) => {
            toast.error(error.message || 'Analysis failed')
        },
    })
}

export function useDeleteDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await deleteDocument(id)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.list() })
            toast.success('Document deleted')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete document')
        },
    })
}
