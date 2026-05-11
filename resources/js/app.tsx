import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import CustomerLayout from '@/layouts/customer-layout';
import AdminLayout from '@/layouts/admin-layout';
import OwnerLayout from '@/layouts/owner-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'Welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [CustomerLayout, SettingsLayout];
            // Customer pages — no sidebar
            case name === 'dashboard' ||
                name === 'Bookings/Index' ||
                name === 'Bookings/Create' ||
                name === 'Venues/Index' ||
                name === 'Venues/Show':
                return CustomerLayout;
            // Admin pages — violet sidebar
            case name.startsWith('Admin/'):
                return AdminLayout;
            // Owner pages — emerald sidebar
            case name.startsWith('Owner/'):
                return OwnerLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
