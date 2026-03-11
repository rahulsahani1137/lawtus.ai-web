'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useUpdateDraft } from '@/hooks/use-draft-queries'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDraftAutosave(
    id: string | undefined,
    content: string | undefined,
) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const updateMutation = useUpdateDraft()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedRef = useRef<string | undefined>(content)

    const save = useCallback(
        async (newContent: string) => {
            if (!id || newContent === lastSavedRef.current) return
            setSaveStatus('saving')
            try {
                await updateMutation.mutateAsync({ id, data: { content: newContent } })
                lastSavedRef.current = newContent
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 2000)
            } catch {
                setSaveStatus('error')
            }
        },
        [id, updateMutation],
    )

    const debouncedSave = useCallback(
        (newContent: string) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            timerRef.current = setTimeout(() => {
                save(newContent)
            }, 2000)
        },
        [save],
    )

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return { saveStatus, debouncedSave }
}
