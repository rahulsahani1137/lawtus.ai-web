import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ChronologyLoading() {
    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <Skeleton className="h-6 w-64" />

            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
