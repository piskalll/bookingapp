import { Head, Link } from '@inertiajs/react';
import { BarChart3, BookOpen, MapPin, Dumbbell, TrendingUp } from 'lucide-react';
import { dashboard } from '@/routes';

interface DashboardStats {
    totalBookings?: number;
    totalVenues?: number;
    totalCourts?: number;
    totalRevenue?: number;
}

export default function Dashboard() {
    // Data statistik (bisa diganti dengan props dari controller)
    const stats: DashboardStats = {
        totalBookings: 0,
        totalVenues: 0,
        totalCourts: 0,
        totalRevenue: 0,
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Selamat datang di Sistem Penyewaan Lapangan Olahraga
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Bookings Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Pesanan
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalBookings ?? '-'}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Venues Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Tempat
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalVenues ?? '-'}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                <MapPin size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Courts Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Lapangan
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalCourts ?? '-'}
                                </p>
                            </div>
                            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                                <Dumbbell size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Pendapatan
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalRevenue ? (
                                        new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                        }).format(stats.totalRevenue)
                                    ) : (
                                        '-'
                                    )}
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                        Akses Cepat
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Manage Venues */}
                        <Link
                            href="/admin/venues"
                            className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                        >
                            <div className="rounded-full bg-blue-100 p-3 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
                                <MapPin size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                Kelola Tempat
                            </p>
                        </Link>

                        {/* Manage Courts */}
                        <Link
                            href="/admin/courts"
                            className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 transition hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600 dark:hover:bg-orange-900/20"
                        >
                            <div className="rounded-full bg-orange-100 p-3 group-hover:bg-orange-200 dark:bg-orange-900/30 dark:group-hover:bg-orange-900/50">
                                <Dumbbell size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                Kelola Lapangan
                            </p>
                        </Link>

                        {/* Manage Bookings */}
                        <Link
                            href="/admin/bookings"
                            className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                        >
                            <div className="rounded-full bg-blue-100 p-3 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
                                <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                Kelola Pesanan
                            </p>
                        </Link>

                        {/* View Reports */}
                        <Link
                            href="/admin/bookings"
                            className="group flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 transition hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
                        >
                            <div className="rounded-full bg-purple-100 p-3 group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-900/50">
                                <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                                Laporan & Analitik
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                        📌 Informasi Penting
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                        <li>
                            ✓ Booking yang pending dan tidak ada bukti pembayaran otomatis dibatalkan
                            setelah 15 menit
                        </li>
                        <li>✓ Gunakan halaman Admin untuk mengelola master data tempat dan lapangan</li>
                        <li>
                            ✓ Semua transaksi pesanan dapat dilihat dan dikelola di halaman Kelola
                            Pesanan
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
