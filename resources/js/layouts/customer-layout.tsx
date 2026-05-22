import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    LogOut,
    User,
    Menu,
    X,
    ChevronDown,
    ClipboardList,
    LayoutDashboard,
} from 'lucide-react';

interface CustomerLayoutProps {
    children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { auth } = usePage().props;

    const user = (auth as any)?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                ⚽
                            </div>
                            <span className="hidden sm:inline font-bold text-gray-900 text-lg">
                                LapanganPro
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                href="/venues"
                                className="text-gray-700 hover:text-emerald-600 transition font-medium"
                            >
                                Lapangan
                            </Link>
                            {user && (
                                <Link
                                    href="/bookings"
                                    className="text-gray-700 hover:text-emerald-600 transition font-medium"
                                >
                                    Pesanan Saya
                                </Link>
                            )}
                        </div>

                        {/* Desktop Right Section: Auth/Guest */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                /* ─── LOGGED IN: Profile Dropdown ─── */
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.name || 'User'}
                                        </span>
                                        <ChevronDown
                                            size={16}
                                            className={`text-gray-500 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Profile Dropdown */}
                                    {profileMenuOpen && (
                                        <>
                                            {/* Backdrop to close dropdown when clicking outside */}
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setProfileMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-20">
                                                {/* User Info */}
                                                <div className="px-4 py-2.5 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                </div>

                                                <Link
                                                    href="/settings/profile"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <User size={16} />
                                                    <span className="text-sm">Profile Saya</span>
                                                </Link>

                                                <Link
                                                    href="/bookings"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <ClipboardList size={16} />
                                                    <span className="text-sm">Riwayat Pesanan</span>
                                                </Link>

                                                {/* Check if user is admin or owner to show Dashboard link */}
                                                {(user?.role === 'admin' || user?.role === 'owner') && (
                                                    <Link
                                                        href={user?.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard'}
                                                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                    >
                                                        <LayoutDashboard size={16} />
                                                        <span className="text-sm">Dashboard</span>
                                                    </Link>
                                                )}

                                                <div className="border-t border-gray-100 mt-1 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        <LogOut size={16} />
                                                        <span className="text-sm">Keluar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* ─── GUEST: Login & Register Buttons ─── */
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 border border-gray-300 rounded-lg hover:border-emerald-400 transition-all duration-200"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm hover:shadow-emerald-200 hover:shadow-md transition-all duration-200"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pb-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <Link
                                href="/venues"
                                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 font-medium transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Lapangan
                            </Link>

                            {user ? (
                                /* ─── MOBILE LOGGED IN ─── */
                                <>
                                    <Link
                                        href="/bookings"
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 font-medium transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Pesanan Saya
                                    </Link>
                                    <Link
                                        href="/settings/profile"
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 font-medium transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Profile Saya
                                    </Link>
                                    <div className="px-4 pt-2 border-t border-gray-100 mt-1">
                                        <div className="flex items-center gap-3 py-2 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-0 py-2 text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition"
                                        >
                                            <LogOut size={16} />
                                            Keluar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* ─── MOBILE GUEST ─── */
                                <div className="px-4 pt-3 pb-1 flex flex-col gap-2 border-t border-gray-100 mt-1">
                                    <Link
                                        href="/login"
                                        className="block text-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-emerald-400 hover:text-emerald-600 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block text-center px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
}
