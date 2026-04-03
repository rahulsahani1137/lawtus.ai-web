'use client'

import { useRouter } from 'next/navigation'
import { Scale, FileText, Upload, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const actions = [
    {
        icon: Scale,
        label: 'Bail Application',
        description: 'Draft a bail application',
        href: '/drafts/new?type=bail_application',
    },
    {
        icon: FileText,
        label: 'Civil Injunction',
        description: 'Draft a civil injunction',
        href: '/drafts/new?type=civil_injunction',
    },
    {
        icon: Upload,
        label: 'Upload Document',
        description: 'Upload & analyze documents',
        href: '/documents',
    },
    {
        icon: MessageSquare,
        label: 'Start Chat',
        description: 'Chat with AI assistant',
        href: '/chat',
    },
]

export function QuickActions() {
    const router = useRouter()

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Card
                    key={action.href}
                    className="cursor-pointer transition-colors shadow-none border border-border hover:border-primary/50 group"
                    onClick={() => router.push(action.href)}
                >
                    <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                            <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {action.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
