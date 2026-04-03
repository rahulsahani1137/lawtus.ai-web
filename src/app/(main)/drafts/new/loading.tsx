import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function NewDraftLoading() {
    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-6 w-64" />

            <div className="space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Skeleton className="h-11 w-56" />
                </div>
            </div>
        </div>
    )
}
