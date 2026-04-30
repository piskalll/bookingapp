import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface Booking {
    id: number;
    customer_name: string;
    customer_email: string;
    court_name: string;
    venue_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    payment_proof: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface BookingsData {
    data: Booking[];
    links: PaginationLink[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

interface Props {
    bookings: BookingsData;
}

// Status Badge
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

export default function OwnerBookingsIndex({ bookings }: Props) {
    return (
        <>
            <Head title="Kelola Pesanan - Owner" />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/owner/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Pesanan</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Semua pesanan untuk lapangan Anda (Total: {bookings.total})
                        </p>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Pesanan</h2>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Halaman {bookings.current_page} dari {bookings.last_page}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {bookings.data.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Penyewa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Venue / Lapangan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Tanggal & Waktu
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
                                    {bookings.data.map((booking, index) => (
                                        <tr
                                            key={booking.id}
                                            className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                                index !== bookings.data.length - 1
                                                    ? 'border-gray-200 dark:border-gray-700'
                                                    : 'border-gray-100 dark:border-gray-700'
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{booking.customer_name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{booking.venue_name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.court_name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Semua pesanan akan ditampilkan di sini</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {(bookings.current_page - 1) * bookings.per_page + 1} hingga{' '}
                                    {Math.min(bookings.current_page * bookings.per_page, bookings.total)} dari {bookings.total} pesanan
                                </div>
                                <div className="flex gap-2">
                                    {bookings.links.map((link, index) => {
                                        // Skip if it's the first or last with ellipsis
                                        if (link.label.includes('...')) return null;

                                        const pageNum = parseInt(link.label);
                                        const isNumeric = !isNaN(pageNum);

                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                        link.url
                                                            ? 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                            : 'border border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-600'
                                                    }`}
                                                    {...(link.url ? {} : { onClick: (e) => e.preventDefault() })}
                                                >
                                                    <ChevronLeft size={16} />
                                                    Sebelumnya
                                                </Link>
                                            );
                                        }

                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                        link.url
                                                            ? 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                            : 'border border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:text-gray-600'
                                                    }`}
                                                    {...(link.url ? {} : { onClick: (e) => e.preventDefault() })}
                                                >
                                                    Selanjutnya
                                                    <ChevronRight size={16} />
                                                </Link>
                                            );
                                        }

                                        if (isNumeric) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
