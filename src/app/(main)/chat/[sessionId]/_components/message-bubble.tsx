'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ChatMessage } from '@/types/chat'
import { cn } from '@/lib/utils'

export function MessageBubble({
    message,
    isStreaming = false,
}: {
    message: ChatMessage
    isStreaming?: boolean
}) {
    const [copied, setCopied] = useState(false)
    const isUser = message.role === 'user'

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.documentIds &&
                        message.metadata.documentIds.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {message.metadata.documentIds.map((docId) => (
                                    <span
                                        key={docId}
                                        className="px-2 py-0.5 rounded-full bg-white/20 text-xs"
                                    >
                                        📎 {docId.slice(0, 8)}...
                                    </span>
                                ))}
                            </div>
                        )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-start group">
            <Card className="max-w-[80%] px-4 py-3 border shadow-sm">
                <div
                    className="text-sm prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                        __html: message.content
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br/>'),
                    }}
                />
                {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5" />
                )}
                {!isStreaming && (
                    <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}
