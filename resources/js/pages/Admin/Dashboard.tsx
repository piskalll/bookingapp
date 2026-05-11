import { Head, Link } from '@inertiajs/react';
import {
    DollarSign,
    Users,
    Building2,
    ClipboardList,
    TrendingUp,
    Clock,
    Activity,
    ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Statistics {
    total_platform_revenue: number;
    total_transactions: number;
    total_customers: number;
    total_active_venues: number;
    total_owners: number;
    pending_confirmations: number;
}

interface Transaction {
    id: number;
    customer_name: string;
    venue_name: string;
    court_name: string;
    booking_date: string;
    total_price: number;
    admin_fee: number;
    owner_revenue: number;
    status: string;
    created_at: string;
}

interface Props {
    statistics: Statistics;
    recent_transactions: Transaction[];
}

const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const statusStyle: Record<string, string> = {
    confirmed:           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending:             'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    waiting_confirmation:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cancelled:           'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    completed:           'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

interface StatCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string;
    sub?: string;
    accent: string;
    iconBg: string;
}

const StatCard = ({ icon: Icon, label, value, sub, accent, iconBg }: StatCardProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                <p className={`mt-1.5 text-2xl font-bold truncate ${accent}`}>{value}</p>
                {sub && <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{sub}</p>}
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
    </div>
);

export default function AdminDashboard({ statistics, recent_transactions }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Administrator</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ringkasan seluruh aktivitas dan pendapatan platform.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatCard
                        icon={DollarSign}
                        label="Pendapatan Platform"
                        value={formatRp(statistics.total_platform_revenue)}
                        sub="Sum admin_fee (confirmed)"
                        accent="text-violet-600 dark:text-violet-400"
                        iconBg="bg-gradient-to-br from-violet-500 to-indigo-600"
                    />
                    <StatCard
                        icon={ClipboardList}
                        label="Total Transaksi"
                        value={statistics.total_transactions.toLocaleString('id-ID')}
                        accent="text-orange-600 dark:text-orange-400"
                        iconBg="bg-gradient-to-br from-orange-500 to-amber-600"
                    />
                    <StatCard
                        icon={Clock}
                        label="Menunggu Konfirmasi"
                        value={statistics.pending_confirmations.toString()}
                        sub={statistics.pending_confirmations > 0 ? 'Perlu ditindaklanjuti' : undefined}
                        accent="text-amber-600 dark:text-amber-400"
                        iconBg="bg-gradient-to-br from-amber-500 to-yellow-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Total Customer"
                        value={statistics.total_customers.toLocaleString('id-ID')}
                        accent="text-blue-600 dark:text-blue-400"
                        iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                    />
                    <StatCard
                        icon={Building2}
                        label="Venue Aktif"
                        value={`${statistics.total_active_venues}`}
                        sub={`dari ${statistics.total_owners} owner`}
                        accent="text-emerald-600 dark:text-emerald-400"
                        iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Total Owner"
                        value={statistics.total_owners.toString()}
                        accent="text-indigo-600 dark:text-indigo-400"
                        iconBg="bg-gradient-to-br from-indigo-500 to-purple-600"
                    />
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-violet-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h2>
                        </div>
                        <Link
                            href="/admin/bookings"
                            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition"
                        >
                            Lihat semua <ArrowRight size={13} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        {recent_transactions.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-sm">Belum ada transaksi.</div>
                        ) : (
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50">
                                        <th className="px-6 py-3">Pelanggan & Venue</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Total</th>
                                        <th className="px-6 py-3 text-violet-600">Fee Admin</th>
                                        <th className="px-6 py-3 text-emerald-600">Revenue Owner</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_transactions.map((t) => (
                                        <tr
                                            key={t.id}
                                            className="border-t border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="px-6 py-3.5">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.customer_name}</p>
                                                <p className="text-xs text-gray-400">{t.venue_name} · {t.court_name}</p>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {t.booking_date
                                                    ? format(new Date(t.booking_date), 'dd MMM yyyy', { locale: id })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {formatRp(t.total_price)}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                                                    {formatRp(t.admin_fee)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatRp(t.owner_revenue)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
