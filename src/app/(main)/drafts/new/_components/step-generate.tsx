'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGenerateDraft } from '@/hooks/use-draft-queries'
import { GenerationProgress } from '@/app/(main)/drafts/new/_components/generation-progress'
import { CASE_TYPE_LABELS, CASE_TYPE_COLORS } from '@/types/draft'
import type { CaseType, DraftGenerateInput } from '@/types/draft'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StepGenerateProps {
    input: DraftGenerateInput
    caseDetails: {
        caseType: CaseType
        court: string
        clientName: string
        documentIds: string[]
    }
    onSuccess: (draftId: string) => void
    onBack: () => void
}

export function StepGenerate({
    input,
    caseDetails,
    onSuccess,
    onBack,
}: StepGenerateProps) {
    const generateMutation = useGenerateDraft()

    const handleGenerate = async () => {
        try {
            const result = await generateMutation.mutateAsync(input)
            toast.success('Draft generated successfully!')
            onSuccess(result.draftId)
        } catch {
            // error handled by mutation hook
        }
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Review & Generate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Case Type</span>
                            <div className="mt-1">
                                <Badge
                                    className={cn(
                                        'text-xs font-medium',
                                        CASE_TYPE_COLORS[caseDetails.caseType],
                                    )}
                                >
                                    {CASE_TYPE_LABELS[caseDetails.caseType]}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Court</span>
                            <p className="font-medium mt-1">{caseDetails.court}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Client</span>
                            <p className="font-medium mt-1">{caseDetails.clientName}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Documents</span>
                            <p className="font-medium mt-1">
                                {caseDetails.documentIds.length} attached
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Generation Progress */}
            {generateMutation.isPending && <GenerationProgress />}

            {/* Actions */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={generateMutation.isPending}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    size="lg"
                >
                    {generateMutation.isPending
                        ? 'Generating...'
                        : 'Generate Full Draft'}
                </Button>
            </div>
        </div>
    )
}
