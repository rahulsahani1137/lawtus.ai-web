'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getChatSessions,
    getSessionMessages,
    createChatSession,
    deleteChatSession,
} from '@/lib/requests/chat'
import type { ChatMode } from '@/types/chat'

export const chatKeys = {
    all: ['chat'] as const,
    sessions: () => [...chatKeys.all, 'sessions'] as const,
    messages: (sessionId: string) =>
        [...chatKeys.all, 'messages', sessionId] as const,
}

export function useChatSessions() {
    return useQuery({
        queryKey: chatKeys.sessions(),
        queryFn: async () => {
            const { sessions } = await getChatSessions()
            return sessions
        },
    })
}

export function useChatMessages(sessionId: string | undefined) {
    return useQuery({
        queryKey: chatKeys.messages(sessionId ?? ''),
        queryFn: async () => {
            if (!sessionId) return []
            const { messages } = await getSessionMessages(sessionId)
            return messages
        },
        enabled: !!sessionId,
    })
}

export function useCreateChatSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            title,
            mode,
        }: {
            title: string
            mode: ChatMode
        }) => {
            const { session } = await createChatSession(title, mode)
            return session
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.sessions() })
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create chat session')
        },
    })
}

export function useDeleteChatSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (sessionId: string) => {
            await deleteChatSession(sessionId)
            return sessionId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.sessions() })
            toast.success('Chat session deleted')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete session')
        },
    })
}
