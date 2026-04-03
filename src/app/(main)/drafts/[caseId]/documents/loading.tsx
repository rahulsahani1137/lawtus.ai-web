import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DocumentsLoading() {
    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <Skeleton className="h-6 w-64" />

            <div className="space-y-2">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-5 w-96" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
