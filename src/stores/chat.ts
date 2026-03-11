import { create } from 'zustand'
import type { ChatSession, ChatMode } from '@/types/chat'

interface ChatState {
    currentSession: ChatSession | null
    activeMode: ChatMode
}

const useChatStore = create<ChatState>()(() => ({
    currentSession: null,
    activeMode: 'draft',
}))

export const useCurrentSession = () =>
    useChatStore((s) => s.currentSession)
export const useActiveMode = () => useChatStore((s) => s.activeMode)

export const ChatActions = {
    setCurrentSession(session: ChatSession | null) {
        useChatStore.setState({ currentSession: session })
    },
    setActiveMode(mode: ChatMode) {
        useChatStore.setState({ activeMode: mode })
    },
}

export default useChatStore
