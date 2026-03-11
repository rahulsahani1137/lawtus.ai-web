import { QuickActions } from '@/app/(main)/dashboard/_components/quick-actions'
import { RecentDrafts } from '@/app/(main)/dashboard/_components/recent-drafts'
import { RecentDocuments } from '@/app/(main)/dashboard/_components/recent-documents'
import { StatsBlock } from '@/app/(main)/dashboard/_components/stats-block'

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back. Here&apos;s an overview of your legal workspace.
                </p>
            </div>

            <StatsBlock />
            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <RecentDrafts />
                </div>
                <div className="lg:col-span-2">
                    <RecentDocuments />
                </div>
            </div>
        </div>
    )
}
