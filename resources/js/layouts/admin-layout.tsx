import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    Users,
    ClipboardList,
    CreditCard,
    Handshake,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Bell,
    Menu,
    X,
    ChevronDown,
    ShieldCheck,
    Banknote,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
    { label: 'Dashboard',          href: '/admin/dashboard',              icon: LayoutDashboard },
    { label: 'Kelola Tempat',      href: '/admin/venues',                 icon: Building2 },
    { label: 'Kelola Mitra',       href: '/admin/partners',               icon: Handshake },
    { label: 'Kelola Pengguna',    href: '/admin/users',                  icon: Users },
    { label: 'Semua Pesanan',      href: '/admin/bookings',               icon: ClipboardList },
    { label: 'Laporan Langganan',  href: '/admin/reports/subscription',   icon: Banknote },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { auth, url } = usePage().props as any;
    const user = auth?.user;
    const currentUrl = (usePage() as any).url as string;

    // Persist sidebar state
    useEffect(() => {
        const saved = localStorage.getItem('admin_sidebar_open');
        if (saved !== null) setSidebarOpen(saved === 'true');
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen((v) => {
            localStorage.setItem('admin_sidebar_open', String(!v));
            return !v;
        });
    };

    const isActive = (href: string) => currentUrl.startsWith(href);

    const handleLogout = () => router.post('/logout');

    return (
        <div className="flex min-h-screen bg-gray-950 font-sans">
            {/* ── Mobile overlay ── */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* ══ SIDEBAR ══ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 border-r border-gray-800
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'w-64' : 'w-[72px]'}
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:inset-auto
                `}
            >
                {/* Logo */}
                <div className="flex items-center h-16 px-4 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-white text-sm leading-tight truncate">LapanganPro</p>
                                <p className="text-xs text-violet-400 font-medium truncate">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!sidebarOpen ? item.label : undefined}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative
                                    ${active
                                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}
                                `}
                            >
                                <Icon
                                    size={20}
                                    className={`shrink-0 transition-colors ${active ? 'text-violet-400' : 'group-hover:text-gray-200'}`}
                                />
                                {sidebarOpen && (
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                )}
                                {active && sidebarOpen && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="border-t border-gray-800 p-3 shrink-0 hidden lg:flex">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center w-full py-2 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen
                            ? <><ChevronLeft size={16} /><span className="ml-2 text-xs font-medium">Collapse</span></>
                            : <ChevronRight size={16} />
                        }
                    </button>
                </div>
            </aside>

            {/* ══ MAIN CONTENT ══ */}
            <div className="flex flex-1 flex-col min-w-0 bg-gray-50 dark:bg-gray-950">
                {/* ── TOP NAVBAR ── */}
                <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
                    {/* Left: mobile toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <Menu size={20} />
                        </button>
                        {/* Page heading area — pages can override via title prop */}
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                <ShieldCheck size={11} />
                                Administrator
                            </span>
                        </div>
                    </div>

                    {/* Right: notifications + profile */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <Bell size={18} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-none truncate max-w-[120px]">
                                        {user?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-none mt-0.5">Super Admin</p>
                                </div>
                                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-20 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/settings/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <User size={15} /> Profil Saya
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                            <LogOut size={15} /> Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
