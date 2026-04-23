import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    LayoutGrid,
    MapPin,
    Dumbbell,
    FileText,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth?.user as any;
    const isAdmin = user?.role === 'admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(isAdmin ? [
            {
                title: 'Kelola Tempat',
                href: '/admin/venues',
                icon: MapPin,
            },
            {
                title: 'Kelola Lapangan',
                href: '/admin/courts',
                icon: Dumbbell,
            },
            {
                title: 'Kelola Pesanan',
                href: '/admin/bookings',
                icon: BookOpen,
            },
            {
                title: 'Laporan',
                href: '/admin/bookings',
                icon: FileText,
            },
        ] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
