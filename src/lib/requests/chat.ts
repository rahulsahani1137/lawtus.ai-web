import { apiFetch, apiStream } from '@/lib/api'
import type { ChatSession, ChatMessage, ChatMode } from '@/types/chat'

export const createChatSession = (title: string, mode: ChatMode) =>
    apiFetch<{ session: ChatSession }>(
        '/chat/sessions',
        { method: 'POST', body: JSON.stringify({ title, mode }) },
    )

export const getChatSessions = () =>
    apiFetch<{ sessions: ChatSession[] }>('/chat/sessions')

export const getSessionMessages = (sessionId: string) =>
    apiFetch<{ messages: ChatMessage[] }>(
        `/chat/sessions/${sessionId}/messages`,
    )

export const deleteChatSession = (sessionId: string) =>
    apiFetch<{ success: boolean; message: string }>(
        `/chat/sessions/${sessionId}`,
        { method: 'DELETE' },
    )

export const streamChatMessage = (params: {
    message: string
    sessionId: string
    mode: ChatMode
    documentIds?: string[]
}) => apiStream('/chat/message', params)
