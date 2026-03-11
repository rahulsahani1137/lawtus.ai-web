'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { streamChatMessage } from '@/lib/requests/chat'
import { chatKeys } from '@/hooks/use-chat-queries'
import type { ChatMode } from '@/types/chat'
import { getAccessToken } from '@/lib/api'

export function ChatInput({
    sessionId,
    mode,
}: {
    sessionId: string
    mode: ChatMode
}) {
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const queryClient = useQueryClient()

    const handleSend = useCallback(async () => {
        const message = input.trim()
        if (!message || isLoading) return

        setInput('')
        setIsLoading(true)

        try {
            const token = getAccessToken()
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/message`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ message, sessionId, mode }),
                },
            )

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.error?.message || err.message || 'Chat failed')
            }

            // Read the SSE stream
            const reader = res.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let done = false

            while (!done) {
                const result = await reader.read()
                done = result.done
                if (result.value) {
                    const _chunk = decoder.decode(result.value, { stream: true })
                    // Stream processing handled by the backend SSE format
                }
            }

            // Invalidate messages to refetch
            queryClient.invalidateQueries({
                queryKey: chatKeys.messages(sessionId),
            })
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to send message'
            toast.error(message)
        } finally {
            setIsLoading(false)
            textareaRef.current?.focus()
        }
    }, [input, isLoading, sessionId, mode, queryClient])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="shrink-0 border-t p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 items-end">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="min-h-[44px] max-h-[200px] resize-none"
                        rows={1}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-11 w-11 shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}
