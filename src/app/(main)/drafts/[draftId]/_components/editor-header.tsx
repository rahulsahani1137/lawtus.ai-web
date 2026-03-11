'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CASE_TYPE_LABELS, CASE_TYPE_COLORS } from '@/types/draft'
import { exportDraft } from '@/lib/requests/drafts'
import { useUpdateDraft } from '@/hooks/use-draft-queries'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Draft } from '@/types/draft'

const SAVE_ICONS = {
    idle: null,
    saving: <Loader2 className="h-3 w-3 animate-spin" />,
    saved: <Check className="h-3 w-3 text-green-500" />,
    error: <AlertCircle className="h-3 w-3 text-destructive" />,
}

const SAVE_LABELS = {
    idle: '',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed',
}

export function EditorHeader({
    draft,
    saveStatus,
}: {
    draft: Draft
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [title, setTitle] = useState(draft.title)
    const updateMutation = useUpdateDraft()

    const handleTitleSave = async () => {
        setIsEditingTitle(false)
        if (title !== draft.title) {
            await updateMutation.mutateAsync({
                id: draft.id,
                data: { title },
            })
        }
    }

    const handleExport = async () => {
        try {
            await exportDraft(draft.id, draft.title)
            toast.success('Draft exported as DOCX')
        } catch {
            toast.error('Export failed')
        }
    }

    return (
        <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/drafts">
                    <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                    My Drafts
                </Link>
            </Button>

            <div className="flex-1 flex items-center gap-3 min-w-0">
                {isEditingTitle ? (
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                        className="h-8 text-sm font-medium max-w-xs"
                        autoFocus
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditingTitle(true)}
                        className="text-sm font-medium truncate hover:text-primary transition-colors"
                    >
                        {draft.title}
                    </button>
                )}

                <Badge
                    className={cn(
                        'text-xs font-medium shrink-0',
                        CASE_TYPE_COLORS[draft.caseType],
                    )}
                >
                    {CASE_TYPE_LABELS[draft.caseType]}
                </Badge>

                <span className="text-xs text-muted-foreground shrink-0 hidden md:inline">
                    {draft.court}
                </span>
            </div>

            {/* Save Status */}
            {saveStatus !== 'idle' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {SAVE_ICONS[saveStatus]}
                    <span>{SAVE_LABELS[saveStatus]}</span>
                </div>
            )}

            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-1 h-3.5 w-3.5" />
                Export DOCX
            </Button>
        </div>
    )
}
