export type ChatMode = 'draft' | 'research' | 'interrogate'

export interface ChatSession {
    id: string
    userId: string
    title: string
    mode: ChatMode
    createdAt: string
    updatedAt: string
}

export interface ChatMessage {
    id: string
    sessionId: string
    role: 'user' | 'assistant'
    content: string
    metadata?: {
        documentIds?: string[]
        mode?: ChatMode
    }
    createdAt: string
}
