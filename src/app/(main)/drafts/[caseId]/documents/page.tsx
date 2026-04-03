'use client'

import { use } from 'react'
import { CLDIBreadcrumb } from '@/components/layout/cldi-breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Upload } from 'lucide-react'

export default function DocumentsPage({
    params,
}: {
    params: Promise<{ caseId: string }>
}) {
    const { caseId } = use(params)

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <CLDIBreadcrumb caseId={caseId} />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
                <p className="text-muted-foreground mt-1">
                    Upload and manage supporting documents for your case
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Documents
                    </CardTitle>
                    <CardDescription>
                        Upload FIRs, court orders, agreements, and other supporting documents
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                        <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Drag and drop files here, or click to browse</p>
                        <p className="text-sm mt-2">Supports PDF, DOCX, JPG, PNG, TIFF</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Uploaded Documents
                        </h3>
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No documents uploaded yet
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline">Skip for Now</Button>
                        <Button>
                            Continue to Review
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
