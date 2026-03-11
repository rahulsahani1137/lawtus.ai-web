'use client'

import { use, useEffect } from 'react'
import { useChatMessages } from '@/hooks/use-chat-queries'
import { useChatSessions } from '@/hooks/use-chat-queries'
import { ChatActions } from '@/stores/chat'
import { ChatHeader } from '@/app/(main)/chat/[sessionId]/_components/chat-header'
import { ChatMessages } from '@/app/(main)/chat/[sessionId]/_components/chat-messages'
import { ChatInput } from '@/app/(main)/chat/[sessionId]/_components/chat-input'

export default function ChatSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>
}) {
    const { sessionId } = use(params)
    const { data: sessions } = useChatSessions()
    const { data: messages, isLoading } = useChatMessages(sessionId)

    const session = sessions?.find((s) => s.id === sessionId)

    useEffect(() => {
        if (session) {
            ChatActions.setCurrentSession(session)
        }
        return () => {
            ChatActions.setCurrentSession(null)
        }
    }, [session])

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <ChatHeader session={session ?? null} />
            <ChatMessages
                messages={messages ?? []}
                isLoading={isLoading}
                sessionMode={session?.mode}
            />
            <ChatInput sessionId={sessionId} mode={session?.mode ?? 'draft'} />
        </div>
    )
}
