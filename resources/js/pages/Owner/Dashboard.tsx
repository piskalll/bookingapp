import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Head, Link } from '@inertiajs/react';
import { DollarSign, Home, Layout, Clock } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

// Interfaces untuk type safety
interface Booking {
    id: number;
    customer_name: string;
    court_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    created_at: string;
}

interface Statistics {
    total_venues: number;
    total_courts: number;
    monthly_revenue: number;
    pending_bookings_count: number;
}

interface Props {
    statistics: Statistics;
    recent_bookings: Booking[];
}

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/owner/dashboard' },
];

// Status Badge Component
interface StatusBadgeProps {
    status: Booking['status'];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<Booking['status'], { bg: string; text: string; border: string; label: string }> = {
        pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Menunggu' },
        confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Terkonfirmasi' },
        completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Selesai' },
        cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Dibatalkan' },
        rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Ditolak' },
    };

    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
        >
            {config.label}
        </span>
    );
};

// Stat Card Component
interface StatCardProps {
    icon: React.ComponentType<{ size: number; className: string }>;
    label: string;
    value: string | number;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-3 dark:from-gray-700 dark:to-gray-600">
                <Icon size={24} className="text-gray-700 dark:text-gray-300" />
            </div>
        </div>
    </div>
);

export default function OwnerDashboard({ statistics, recent_bookings }: Props) {
    const formatDateTime = (date: string, time: string) => {
        try {
            const dateObj = new Date(date);
            const dateFormatted = format(dateObj, 'dd MMM yyyy', { locale: id });
            return `${dateFormatted} ${time}`;
        } catch (e) {
            return `${date} ${time}`;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <Head title="Dashboard Owner" />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Owner</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Kelola dan pantau bisnis penyewaan lapangan Anda
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Home}
                        label="Total Venue"
                        value={statistics.total_venues}
                    />
                    <StatCard
                        icon={Layout}
                        label="Total Lapangan"
                        value={statistics.total_courts}
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Pendapatan Bulan Ini"
                        value={formatPrice(statistics.monthly_revenue)}
                    />
                    <StatCard
                        icon={Clock}
                        label="Pesanan Menunggu"
                        value={statistics.pending_bookings_count}
                    />
                </div>

                {/* Recent Bookings Section */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pesanan Terbaru</h2>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {recent_bookings.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Penyewa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Lapangan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Waktu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Nominal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_bookings.map((booking, index) => (
                                        <tr
                                            key={booking.id}
                                            className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                index !== recent_bookings.length - 1
                                                    ? 'border-gray-200 dark:border-gray-700'
                                                    : 'border-gray-100 dark:border-gray-700'
                                            }`}
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <p className="font-medium text-gray-900 dark:text-white">{booking.customer_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-700 dark:text-gray-300">{booking.court_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDateTime(booking.booking_date, booking.start_time)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    {booking.start_time} - {booking.end_time}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatPrice(booking.total_price)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <svg
                                    className="mx-auto mb-4 h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <p className="font-medium text-gray-600 dark:text-gray-400">Belum ada pesanan</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Pesanan Anda akan ditampilkan di sini</p>
                            </div>
                        )}
                    </div>

                    {/* Footer with action button */}
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <div className="flex justify-end">
                            <Link
                                href="/owner/bookings"
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
                            >
                                <span>Lihat Semua Pesanan</span>
                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
