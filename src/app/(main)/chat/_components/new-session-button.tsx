'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateChatSession } from '@/hooks/use-chat-queries'
import type { ChatMode } from '@/types/chat'
import { cn } from '@/lib/utils'

const modes: { value: ChatMode; label: string; activeClass: string; inactiveClass: string }[] = [
    {
        value: 'draft',
        label: 'Draft',
        activeClass: 'bg-blue-600 text-white',
        inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
        value: 'research',
        label: 'Research',
        activeClass: 'bg-green-600 text-white',
        inactiveClass: 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
        value: 'interrogate',
        label: 'Interrogate',
        activeClass: 'bg-amber-600 text-white',
        inactiveClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
]

export function NewSessionButton() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ChatMode>('draft')
    const [title, setTitle] = useState('')
    const createMutation = useCreateChatSession()

    const handleCreate = async () => {
        const session = await createMutation.mutateAsync({
            title: title || `New ${mode} chat`,
            mode,
        })
        setOpen(false)
        setTitle('')
        router.push(`/chat/${session.id}`)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Chat Session</DialogTitle>
                    <DialogDescription>
                        Choose a mode and optionally name your session.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Mode</Label>
                        <div className="flex gap-2">
                            {modes.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    className={cn(
                                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                                        mode === m.value ? m.activeClass : m.inactiveClass,
                                    )}
                                    onClick={() => setMode(m.value)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="session-title">Title (optional)</Label>
                        <Input
                            id="session-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Bail application research"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleCreate}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creating...' : 'Start Chat'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
