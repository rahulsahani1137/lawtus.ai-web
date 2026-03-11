'use client'

import { use, useEffect } from 'react'
import { useDraftDetail } from '@/hooks/use-draft-queries'
import { useCurrentDraft, DraftActions } from '@/stores/drafts'
import { EditorHeader } from '@/app/(main)/drafts/[draftId]/_components/editor-header'
import { LegalEditor } from '@/app/(main)/drafts/[draftId]/_components/legal-editor'
import { ChronologyTab } from '@/app/(main)/drafts/[draftId]/_components/chronology-tab'
import { WarningsTab } from '@/app/(main)/drafts/[draftId]/_components/warnings-tab'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDraftAutosave } from '@/hooks/use-draft-autosave'

export default function DraftEditorPage({
    params,
}: {
    params: Promise<{ draftId: string }>
}) {
    const { draftId } = use(params)
    const { isLoading } = useDraftDetail(draftId)
    const draft = useCurrentDraft()

    const { saveStatus, debouncedSave } = useDraftAutosave(
        draftId,
        draft?.content,
    )

    useEffect(() => {
        return () => {
            DraftActions.setCurrentDraft(null)
        }
    }, [])

    const handleContentChange = (newContent: string) => {
        DraftActions.updateDraftContent(draftId, newContent)
        debouncedSave(newContent)
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        )
    }

    if (!draft) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                Draft not found.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <EditorHeader draft={draft} saveStatus={saveStatus} />
            <div className="flex-1 min-h-0">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize={65} minSize={40}>
                        <LegalEditor
                            content={draft.content}
                            onChange={handleContentChange}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={35} minSize={25}>
                        <Tabs defaultValue="chronology" className="h-full flex flex-col">
                            <TabsList className="w-full justify-start rounded-none border-b px-4">
                                <TabsTrigger value="chronology">Chronology</TabsTrigger>
                                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="chronology"
                                className="flex-1 overflow-auto p-4 mt-0"
                            >
                                <ChronologyTab chronology={draft.chronology ?? []} />
                            </TabsContent>
                            <TabsContent
                                value="warnings"
                                className="flex-1 overflow-auto p-4 mt-0"
                            >
                                <WarningsTab warnings={draft.warnings ?? []} />
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
