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
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        icon: FileText,
        label: 'Civil Injunction',
        description: 'Draft a civil injunction',
        href: '/drafts/new?type=civil_injunction',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        icon: Upload,
        label: 'Upload Document',
        description: 'Upload & analyze documents',
        href: '/documents',
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        icon: MessageSquare,
        label: 'Start Chat',
        description: 'Chat with AI assistant',
        href: '/chat',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
]

export function QuickActions() {
    const router = useRouter()

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Card
                    key={action.href}
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => router.push(action.href)}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                        <div
                            className={`p-3 rounded-xl ${action.bg}`}
                        >
                            <action.icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{action.label}</p>
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
