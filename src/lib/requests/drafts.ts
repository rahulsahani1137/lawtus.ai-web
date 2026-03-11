import { apiFetch, getAccessToken } from '@/lib/api'
import type { Draft, DraftListItem, DraftGenerateInput } from '@/types/draft'

export const generateDraft = (input: DraftGenerateInput) =>
    apiFetch<{
        draftId: string
        title: string
        content: string
        chronology: unknown[]
        warnings: string[]
    }>('/drafts/generate', {
        method: 'POST',
        body: JSON.stringify(input),
    })

export const getDrafts = () =>
    apiFetch<{ drafts: DraftListItem[] }>('/drafts')

export const getDraft = (id: string) =>
    apiFetch<{ draft: Draft }>(`/drafts/${id}`)

export const updateDraft = (
    id: string,
    data: { title?: string; content?: string },
) =>
    apiFetch<{ draft: Draft }>(`/drafts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })

export const deleteDraft = (id: string) =>
    apiFetch<{ success: boolean; message: string }>(
        `/drafts/${id}`,
        { method: 'DELETE' },
    )

export async function exportDraft(
    id: string,
    filename: string,
): Promise<void> {
    const token = getAccessToken()
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drafts/${id}/export`,
        {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
    )
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.docx`
    a.click()
    URL.revokeObjectURL(url)
}
