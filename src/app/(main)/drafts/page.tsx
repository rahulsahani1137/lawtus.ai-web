'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DraftsTable } from '@/app/(main)/drafts/_components/drafts-table'

export default function DraftsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Drafts</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your legal document drafts
                    </p>
                </div>
                <Button asChild>
                    <Link href="/drafts/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Draft
                    </Link>
                </Button>
            </div>
            <DraftsTable />
        </div>
    )
}
