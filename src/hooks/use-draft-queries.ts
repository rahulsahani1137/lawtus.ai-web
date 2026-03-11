'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getDrafts,
    getDraft,
    generateDraft,
    updateDraft,
    deleteDraft,
} from '@/lib/requests/drafts'
import { DraftActions } from '@/stores/drafts'
import type { DraftGenerateInput } from '@/types/draft'

export const draftKeys = {
    all: ['drafts'] as const,
    list: () => [...draftKeys.all, 'list'] as const,
    detail: (id: string) => [...draftKeys.all, 'detail', id] as const,
}

export function useDraftsList() {
    return useQuery({
        queryKey: draftKeys.list(),
        queryFn: async () => {
            const { drafts } = await getDrafts()
            return drafts
        },
    })
}

export function useDraftDetail(id: string | undefined) {
    return useQuery({
        queryKey: draftKeys.detail(id ?? ''),
        queryFn: async () => {
            if (!id) return null
            const { draft } = await getDraft(id)
            DraftActions.setCurrentDraft(draft)
            return draft
        },
        enabled: !!id,
    })
}

export function useGenerateDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: DraftGenerateInput) => {
            const result = await generateDraft(input)
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: draftKeys.list() })
        },
        onError: (error) => {
            toast.error(error.message || 'Draft generation failed')
        },
    })
}

export function useUpdateDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string
            data: { title?: string; content?: string }
        }) => {
            const { draft } = await updateDraft(id, data)
            return draft
        },
        onSuccess: (draft) => {
            DraftActions.setCurrentDraft(draft)
            queryClient.invalidateQueries({ queryKey: draftKeys.detail(draft.id) })
            queryClient.invalidateQueries({ queryKey: draftKeys.list() })
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save draft')
        },
    })
}

export function useDeleteDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await deleteDraft(id)
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: draftKeys.list() })
            toast.success('Draft deleted')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete draft')
        },
    })
}
