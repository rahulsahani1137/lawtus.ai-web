'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReviewError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Review page error:', error)
    }, [error])

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Error Loading Review
                    </CardTitle>
                    <CardDescription>
                        Something went wrong while loading the review page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    <Button onClick={reset}>Try Again</Button>
                </CardContent>
            </Card>
        </div>
    )
}
