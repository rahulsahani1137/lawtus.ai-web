'use client'

import { use } from 'react'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Share2 } from 'lucide-react'

export default function DraftPage({
    params,
}: {
    params: Promise<{ caseId: string }>
}) {
    const { caseId } = use(params)

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <CLDIBreadcrumb caseId={caseId} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Final Draft</h1>
                    <p className="text-muted-foreground mt-1">
                        Your generated legal document
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Preview
                    </CardTitle>
                    <CardDescription>
                        Review your generated legal document
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-8 min-h-[600px] bg-white text-foreground">
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Generated draft will appear here</p>
                            <p className="text-sm mt-2">This will include the full legal document with formatting</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
