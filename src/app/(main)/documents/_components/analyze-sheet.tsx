'use client'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { DocumentAnalysis } from '@/types/document'

export function AnalyzeSheet({
    open,
    onOpenChange,
    analysis,
    title,
    isLoading,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    analysis: DocumentAnalysis | null
    title: string
    isLoading: boolean
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Document Analysis</SheetTitle>
                    <SheetDescription>{title}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {isLoading || !analysis ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <>
                            {/* Document Type */}
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Document Type
                                </h4>
                                <Badge variant="secondary" className="text-sm">
                                    {analysis.documentType}
                                </Badge>
                            </div>

                            <Separator />

                            {/* Parties */}
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Parties
                                </h4>
                                <p className="text-sm">{analysis.parties.join(', ')}</p>
                            </div>

                            <Separator />

                            {/* Key Dates */}
                            {analysis.keyDates.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Key Dates
                                    </h4>
                                    <div className="space-y-2">
                                        {analysis.keyDates.map((kd, i) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 text-xs"
                                                >
                                                    {kd.date}
                                                </Badge>
                                                <span className="text-sm">{kd.event}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Sections Invoked */}
                            {analysis.sectionsInvoked.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Sections Invoked
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.sectionsInvoked.map((section) => (
                                            <Badge
                                                key={section}
                                                variant="secondary"
                                                className="text-xs font-mono"
                                            >
                                                {section}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Summary */}
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Summary
                                </h4>
                                <p className="text-sm leading-relaxed">
                                    {analysis.summary}
                                </p>
                            </div>

                            <Separator />

                            {/* Extracted Facts */}
                            {analysis.extractedFacts.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Extracted Facts
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {analysis.extractedFacts.map((fact, i) => (
                                            <li key={i} className="text-sm">
                                                {fact}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
