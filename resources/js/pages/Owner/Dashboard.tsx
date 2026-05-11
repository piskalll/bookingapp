import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Head, Link } from '@inertiajs/react';
import { DollarSign, Home, Layout, Clock, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

interface Booking {
    id: number;
    customer_name: string;
    court_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    admin_fee: number;
    owner_revenue: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    created_at: string;
}

interface Statistics {
    total_venues: number;
    total_courts: number;
    monthly_revenue: number;
    pending_bookings_count: number;
}

interface SubscriptionAlert {
    type: 'warning' | 'danger';
    message: string;
}

interface Props {
    statistics: Statistics;
    recent_bookings: Booking[];
    subscription_alert: SubscriptionAlert | null;
    subscription_ends_at: string | null;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string; label: string }> = {
        pending:              { bg: 'bg-amber-50 border border-amber-200',   text: 'text-amber-700',   label: 'Menunggu' },
        waiting_confirmation: { bg: 'bg-blue-50 border border-blue-200',     text: 'text-blue-700',    label: 'Cek Pembayaran' },
        confirmed:            { bg: 'bg-emerald-50 border border-emerald-200',text: 'text-emerald-700', label: 'Terkonfirmasi' },
        completed:            { bg: 'bg-gray-100 border border-gray-300',    text: 'text-gray-700',    label: 'Selesai' },
        cancelled:            { bg: 'bg-red-50 border border-red-200',       text: 'text-red-700',     label: 'Dibatalkan' },
        rejected:             { bg: 'bg-red-50 border border-red-200',       text: 'text-red-700',     label: 'Ditolak' },
    };
    
    const c = cfg[status] || { bg: 'bg-gray-100 border border-gray-300', text: 'text-gray-700', label: status };
    
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string | number;
    sub?: string;
}
const StatCard = ({ icon: Icon, label, value, sub }: StatCardProps) => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                </p>
                {sub && <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">{sub}</p>}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3">
                <Icon size={22} className="text-gray-600 dark:text-gray-300" />
            </div>
        </div>
    </div>
);

export default function OwnerDashboard({ statistics, recent_bookings, subscription_alert }: Props) {
    const formatDateTime = (date: string, time: string) => {
        try {
            return `${format(new Date(date), 'dd MMM yyyy', { locale: id })} ${time}`;
        } catch { return `${date} ${time}`; }
    };

    const formatRp = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    return (
        <>
            <Head title="Dashboard Owner" />

            <div className="flex-1 space-y-5 p-6">
                {/* ── Subscription Alert Banner ── */}
                {subscription_alert && (
                    <div
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                            subscription_alert.type === 'danger'
                                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300'
                        }`}
                    >
                        {subscription_alert.type === 'danger'
                            ? <XCircle size={18} className="shrink-0 mt-0.5" />
                            : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                        <span>{subscription_alert.message}</span>
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Owner</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kelola dan pantau bisnis penyewaan lapangan Anda.
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Home}      label="Total Venue"      value={statistics.total_venues} />
                    <StatCard icon={Layout}    label="Total Lapangan"   value={statistics.total_courts} />
                    <StatCard
                        icon={DollarSign}
                        label="Pendapatan Bersih Bulan Ini"
                        value={formatRp(statistics.monthly_revenue)}
                        sub="Setelah potongan komisi"
                    />
                    <StatCard icon={Clock}     label="Pesanan Menunggu" value={statistics.pending_bookings_count} />
                </div>

                {/* Recent Bookings */}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Pesanan Terbaru</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {recent_bookings.length > 0 ? (
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        {['Penyewa','Lapangan','Waktu','Total','Komisi Admin','Bersih Anda','Status'].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_bookings.map((booking, i) => (
                                        <tr
                                            key={booking.id}
                                            className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                                                i !== recent_bookings.length - 1
                                                    ? 'border-gray-200 dark:border-gray-700'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <td className="px-5 py-3.5 font-medium text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                {booking.customer_name}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                                                {booking.court_name}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDateTime(booking.booking_date, booking.start_time)}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatRp(booking.total_price)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                                                    <TrendingDown size={12} /> {formatRp(booking.admin_fee)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRp(booking.owner_revenue)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-400 text-sm">
                                Belum ada pesanan masuk.
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-end">
                        <Link
                            href="/owner/bookings"
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow hover:from-emerald-700 hover:to-teal-700 transition"
                        >
                            Lihat Semua Pesanan
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
