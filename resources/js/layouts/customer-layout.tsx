import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    LogOut,
    User,
    Menu,
    X,
    ChevronDown,
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
                            <Link
                                href="/bookings"
                                className="text-gray-700 hover:text-emerald-600 transition font-medium"
                            >
                                Pesanan Saya
                            </Link>
                        </div>

                        {/* Desktop Profile Menu */}
                        <div className="hidden md:flex items-center gap-4 relative">
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
                                    <ChevronDown size={16} className="text-gray-600" />
                                </button>

                                {/* Profile Dropdown */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
                                        <Link
                                            href="/settings/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <User size={16} />
                                            <span className="text-sm">Profile Saya</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                                        >
                                            <LogOut size={16} />
                                            <span className="text-sm">Keluar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pb-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <Link
                                href="/venues"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Lapangan
                            </Link>
                            <Link
                                href="/bookings"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pesanan Saya
                            </Link>
                            <Link
                                href="/settings/profile"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile Saya
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                            >
                                Keluar
                            </button>
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
