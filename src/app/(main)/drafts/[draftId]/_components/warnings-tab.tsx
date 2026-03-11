'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function WarningsTab({
    warnings: initialWarnings,
}: {
    warnings: string[]
}) {
    const [warnings, setWarnings] = useState(initialWarnings)

    const dismiss = (index: number) => {
        setWarnings((prev) => prev.filter((_, i) => i !== index))
    }

    if (warnings.length === 0) {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium text-green-700">
                    ✓ No warnings detected.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
                {warnings.length} warning{warnings.length !== 1 ? 's' : ''} found
            </h3>
            {warnings.map((warning, i) => (
                <Card key={i} className="bg-amber-50 border-amber-200">
                    <CardContent className="p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800 flex-1">{warning}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => dismiss(i)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
