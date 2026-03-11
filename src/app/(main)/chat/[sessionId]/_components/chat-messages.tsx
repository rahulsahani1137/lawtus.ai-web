'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'
import { MessageBubble } from '@/app/(main)/chat/[sessionId]/_components/message-bubble'
import type { ChatMessage } from '@/types/chat'
import type { ChatMode } from '@/types/chat'

const MODE_PROMPTS: Record<ChatMode, string> = {
    draft: 'Describe the legal document you need help drafting...',
    research: 'What legal topic would you like to research?',
    interrogate: 'Paste the document text you want to analyze...',
}

export function ChatMessages({
    messages,
    isLoading,
    sessionMode,
    streamingContent,
}: {
    messages: ChatMessage[]
    isLoading: boolean
    sessionMode?: ChatMode
    streamingContent?: string
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingContent])

    if (isLoading) {
        return (
            <div className="flex-1 p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-16 w-2/3 rounded-xl" />
                    </div>
                ))}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                        {MODE_PROMPTS[sessionMode ?? 'draft']}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="p-4 space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {streamingContent && (
                    <MessageBubble
                        message={{
                            id: 'streaming',
                            sessionId: '',
                            role: 'assistant',
                            content: streamingContent,
                            createdAt: new Date().toISOString(),
                        }}
                        isStreaming
                    />
                )}
                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    )
}
