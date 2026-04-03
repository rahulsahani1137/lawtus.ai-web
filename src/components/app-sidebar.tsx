'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    FilePlus,
    FileText,
    MessageSquare,
    FolderOpen,
    LogOut,
} from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser, AuthActions } from '@/store/authStore'
import { logoutCurrent } from '@/lib/requests/auth'
import { clearRefreshTokenAction } from '@/actions/auth'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'New Draft',
        href: '/drafts/new',
        icon: FilePlus,
    },
    {
        title: 'My Drafts',
        href: '/drafts',
        icon: FileText,
    },
]

const workspaceNavItems = [
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FolderOpen,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const user = useUser()

    const handleLogout = async () => {
        try {
            await logoutCurrent()
        } catch {
            // Even if server logout fails, clear local state
        }
        await clearRefreshTokenAction()
        AuthActions.logout()
        toast.success('Successfully logged out')
        router.push('/auth/login')
    }

    const isActive = (href: string) => {
        if (href === '/drafts' && pathname === '/drafts') return true
        if (href === '/drafts/new' && pathname === '/drafts/new') return true
        if (href !== '/drafts' && href !== '/drafts/new') {
            return pathname.startsWith(href)
        }
        return false
    }

    const userInitials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? '?'

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                        L
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        Lawtus AI
                    </span>
                </div>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {workspaceNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.href)}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
