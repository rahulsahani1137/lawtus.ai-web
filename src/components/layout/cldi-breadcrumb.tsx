'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface CLDIBreadcrumbProps {
    caseId?: string
    caseTitle?: string
}

export function CLDIBreadcrumb({ caseId, caseTitle }: CLDIBreadcrumbProps) {
    const pathname = usePathname()

    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            { label: 'Drafts', href: '/drafts' }
        ]

        if (pathname === '/drafts/new') {
            items.push({ label: 'New Draft' })
            return items
        }

        if (caseId) {
            items.push({
                label: caseTitle || `Case ${caseId.slice(0, 8)}`,
                href: `/drafts/${caseId}`
            })

            if (pathname.includes('/interrogate')) {
                items.push({ label: 'Fact Collection' })
            } else if (pathname.includes('/chronology')) {
                items.push({ label: 'Chronology' })
            } else if (pathname.includes('/documents')) {
                items.push({ label: 'Documents' })
            } else if (pathname.includes('/review')) {
                items.push({ label: 'Review' })
            } else if (pathname.includes('/draft')) {
                items.push({ label: 'Final Draft' })
            }
        }

        return items
    }

    const breadcrumbs = getBreadcrumbs()

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    )
}
