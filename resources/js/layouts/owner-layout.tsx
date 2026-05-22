import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    CalendarCheck,
    Trophy,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Bell,
    Menu,
    ChevronDown,
    Briefcase,
    CreditCard,
    ScanLine,
} from 'lucide-react';

interface OwnerLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
}

const navItems: NavItem[] = [
    { label: 'Dashboard',          href: '/owner/dashboard',          icon: LayoutDashboard },
    { label: 'Kelola Tempat',      href: '/owner/venues',             icon: Briefcase       },
    { label: 'Kelola Lapangan',    href: '/owner/courts',             icon: Trophy          },
    { label: 'Kelola Pesanan',     href: '/owner/bookings',           icon: CalendarCheck   },
    { label: 'Verifikasi Pesanan', href: '/owner/bookings/verify',    icon: ScanLine        },
    { label: 'Langganan',          href: '/owner/subscription',       icon: CreditCard      },
];

export default function OwnerLayout({ children }: OwnerLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const currentUrl = (usePage() as any).url as string;

    useEffect(() => {
        const saved = localStorage.getItem('owner_sidebar_open');
        if (saved !== null) setSidebarOpen(saved === 'true');
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen((v) => {
            localStorage.setItem('owner_sidebar_open', String(!v));
            return !v;
        });
    };
    const isActive = (href: string) => {
        if (href === '/owner/bookings' && currentUrl.startsWith('/owner/bookings/verify')) {
            return false;
        }
        return currentUrl.startsWith(href);
    };

    const handleLogout = () => router.post('/logout');

    return (
        <div className="flex min-h-screen bg-slate-950 font-sans">
            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* ══ SIDEBAR ══ */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 flex flex-col
                    bg-slate-900 border-r border-slate-800
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'w-64' : 'w-[72px]'}
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:inset-auto
                `}
            >
                {/* Logo */}
                <div className="flex items-center h-16 px-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40">
                            <Briefcase size={17} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-white text-sm leading-tight truncate">LapanganPro</p>
                                <p className="text-xs text-emerald-400 font-medium truncate">Owner Panel</p>
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
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                    ${active
                                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                                `}
                            >
                                <Icon
                                    size={20}
                                    className={`shrink-0 transition-colors ${active ? 'text-emerald-400' : 'group-hover:text-slate-200'}`}
                                />
                                {sidebarOpen && (
                                    <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                                )}
                                {active && sidebarOpen && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar footer: user info */}
                {sidebarOpen && (
                    <div className="border-t border-slate-800 p-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'O'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Owner'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapse Toggle */}
                <div className="border-t border-slate-800 p-3 shrink-0 hidden lg:flex">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center w-full py-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                        {sidebarOpen
                            ? <><ChevronLeft size={16} /><span className="ml-2 text-xs font-medium">Collapse</span></>
                            : <ChevronRight size={16} />
                        }
                    </button>
                </div>
            </aside>

            {/* ══ MAIN ══ */}
            <div className="flex flex-1 flex-col min-w-0 bg-gray-50 dark:bg-slate-950">
                {/* ── TOP NAVBAR ── */}
                <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                            <Briefcase size={11} />
                            Owner
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                            <Bell size={18} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || 'O'}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-none truncate max-w-[120px]">
                                        {user?.name || 'Owner'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-none mt-0.5">Mitra Lapangan</p>
                                </div>
                                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl z-20 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/settings/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
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
