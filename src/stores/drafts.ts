import { create } from 'zustand'
import type { Draft } from '@/types/draft'

interface DraftsState {
    currentDraft: Draft | null
}

const useDraftsStore = create<DraftsState>()(() => ({
    currentDraft: null,
}))

export const useCurrentDraft = () =>
    useDraftsStore((s) => s.currentDraft)

export const DraftActions = {
    setCurrentDraft(draft: Draft | null) {
        useDraftsStore.setState({ currentDraft: draft })
    },
    updateDraftContent(id: string, content: string) {
        useDraftsStore.setState((s) => ({
            currentDraft:
                s.currentDraft?.id === id
                    ? { ...s.currentDraft, content }
                    : s.currentDraft,
        }))
    },
}

export default useDraftsStore
