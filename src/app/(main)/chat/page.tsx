'use client'

import { SessionList } from '@/app/(main)/chat/_components/session-list'
import { NewSessionButton } from '@/app/(main)/chat/_components/new-session-button'

export default function ChatPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered legal research and document analysis
                    </p>
                </div>
                <NewSessionButton />
            </div>
            <SessionList />
        </div>
    )
}
