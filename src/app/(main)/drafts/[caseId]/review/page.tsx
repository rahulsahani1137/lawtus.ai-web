'use client'

import { use } from 'react'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ReviewPage({
    params,
}: {
    params: Promise<{ caseId: string }>
}) {
    const { caseId } = use(params)

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <CLDIBreadcrumb caseId={caseId} />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Contradiction Review</h1>
                <p className="text-muted-foreground mt-1">
                    Review and resolve any factual inconsistencies before generating the draft
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Contradictions
                        </CardTitle>
                        <CardDescription>
                            Factual inconsistencies detected across sources
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <Button variant="outline">Run Contradiction Check</Button>
                            <p className="text-sm mt-4">Click to analyze your case for contradictions</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Case Summary
                        </CardTitle>
                        <CardDescription>
                            Overview of collected information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Facts Collected</span>
                            <Badge variant="secondary">0</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Timeline Events</span>
                            <Badge variant="secondary">0</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Documents</span>
                            <Badge variant="secondary">0</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ready to Generate Draft</CardTitle>
                    <CardDescription>
                        All information has been collected and verified
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <Button size="lg">
                            Generate Draft
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
