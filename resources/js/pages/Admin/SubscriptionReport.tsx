import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    TrendingUp, Download, Calendar, Filter,
    BadgeCheck, XCircle, Clock, Building2,
    RefreshCw, ChevronDown, BarChart3,
    Banknote, Users, Receipt, ArrowUpRight,
    Printer,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */
interface PaymentRow {
    id: number;
    owner_id: number;
    owner_name: string;
    owner_email: string;
    order_id: string;
    amount: number;
    months: number | null;
    status: 'success' | 'pending' | 'failed';
    created_at: string;
}

interface PartnerSummary {
    id: number;
    name: string;
    email: string;
    transaction_count: number;
    total_paid: number;
    subscription_status: 'active' | 'inactive';
    subscription_ends_at: string | null;
}

interface MonthlyData {
    month: string;   // e.g. "2026-05"
    label: string;   // e.g. "Mei 2026"
    total: number;
    count: number;
}

interface Props {
    payments: PaymentRow[];
    partnerSummary: PartnerSummary[];
    monthlyData: MonthlyData[];
    stats: {
        totalRevenue: number;
        totalTransactions: number;
        totalPartners: number;
        successRevenue: number;
        pendingRevenue: number;
    };
    filters: {
        start_date: string;
        end_date: string;
        status: string;
    };
    flash?: { success?: string; error?: string };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */
const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const formatMonth = (d: string) =>
    new Date(d + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

/* ------------------------------------------------------------------ */
/* Stat Card                                                             */
/* ------------------------------------------------------------------ */
function StatCard({
    icon: Icon, label, value, sub, color, bgColor, trend,
}: {
    icon: React.ElementType; label: string; value: string;
    sub?: string; color: string; bgColor: string; trend?: string;
}) {
    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10" style={{ background: color }} />
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} shrink-0`}>
                    <Icon size={20} style={{ color }} />
                </div>
                {trend && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        <ArrowUpRight size={11} />{trend}
                    </span>
                )}
            </div>
            <p className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Status Badge                                                          */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { cls: string; icon: React.ElementType; label: string }> = {
        success: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: BadgeCheck, label: 'Berhasil' },
        pending: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',   icon: Clock,      label: 'Pending' },
        failed:  { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',           icon: XCircle,    label: 'Gagal' },
    };
    const c = cfg[status] ?? cfg.pending;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.cls}`}>
            <Icon size={10} />{c.label}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Monthly Chart (simple CSS bar chart)                                  */
/* ------------------------------------------------------------------ */
function MonthlyChart({ data }: { data: MonthlyData[] }) {
    if (data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.total), 1);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={16} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pendapatan per Bulan</h3>
            </div>
            <div className="flex items-end gap-2 h-36">
                {data.map((d) => {
                    const pct = (d.total / max) * 100;
                    return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                                <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-teal-600 group-hover:to-teal-400 transition-all"
                                    style={{ height: `${Math.max(4, pct)}%` }}
                                />
                                {/* Tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {formatRp(d.total)}
                                </div>
                            </div>
                            <span className="text-[9px] text-gray-400 text-center leading-tight">{d.label}</span>
                            <span className="text-[9px] font-bold text-emerald-600">{d.count}x</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                             */
/* ------------------------------------------------------------------ */
export default function SubscriptionReport({
    payments, partnerSummary, monthlyData, stats, filters, flash,
}: Props) {
    const [localFilters, setLocalFilters] = useState({
        start_date: filters.start_date,
        end_date:   filters.end_date,
        status:     filters.status,
    });
    const [tab, setTab] = useState<'transactions' | 'partners'>('transactions');
    const [exporting, setExporting] = useState(false);

    const applyFilters = () => {
        router.get('/admin/reports/subscription', localFilters, { preserveState: true, preserveScroll: true });
    };

    const exportPdf = () => {
        setExporting(true);
        const params = new URLSearchParams(localFilters).toString();
        window.open(`/admin/reports/subscription-pdf?${params}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    };

    const maxPartnerPaid = useMemo(
        () => Math.max(...partnerSummary.map((p) => p.total_paid), 1),
        [partnerSummary],
    );

    return (
        <>
            <Head title="Laporan Keuangan Langganan" />
            <div className="p-6 space-y-6">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                        <BadgeCheck size={16} className="shrink-0" />{flash.success}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Banknote size={22} className="text-emerald-600" />
                            Laporan Keuangan Langganan
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Rekap pendapatan dari pembayaran langganan mitra owner.
                        </p>
                    </div>
                    <button
                        onClick={exportPdf}
                        disabled={exporting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {exporting
                            ? <><RefreshCw size={15} className="animate-spin" /> Menyiapkan...</>
                            : <><Printer size={15} /> Cetak PDF</>
                        }
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={TrendingUp} label="Total Pendapatan" value={formatRp(stats.totalRevenue)}
                        sub="seluruh periode" color="#059669" bgColor="bg-emerald-100" trend="+transaksi"
                    />
                    <StatCard
                        icon={Receipt} label="Transaksi Berhasil" value={String(stats.totalTransactions)}
                        sub="pembayaran sukses" color="#1d4ed8" bgColor="bg-blue-100"
                    />
                    <StatCard
                        icon={Users} label="Mitra Aktif" value={String(stats.totalPartners)}
                        sub="owner terdaftar" color="#7c3aed" bgColor="bg-violet-100"
                    />
                    <StatCard
                        icon={Clock} label="Pending" value={formatRp(stats.pendingRevenue)}
                        sub="menunggu konfirmasi" color="#d97706" bgColor="bg-amber-100"
                    />
                </div>

                {/* ── Chart ── */}
                <MonthlyChart data={monthlyData} />

                {/* ── Filter Bar ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mr-1">
                            <Filter size={14} className="text-emerald-600" /> Filter
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.start_date}
                                onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={localFilters.end_date}
                                onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Status</label>
                            <div className="relative">
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                    className="appearance-none pr-8 pl-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="success">Berhasil</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Gagal</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <button
                            onClick={applyFilters}
                            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                            <Filter size={13} /> Terapkan
                        </button>
                        <button
                            onClick={() => {
                                const def = { start_date: '', end_date: '', status: '' };
                                setLocalFilters(def);
                                router.get('/admin/reports/subscription', def, { preserveState: true });
                            }}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Reset
                        </button>
                        {/* Export button in filter bar too */}
                        <button
                            onClick={exportPdf}
                            disabled={exporting}
                            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition disabled:opacity-60"
                        >
                            <Download size={13} /> Export PDF
                        </button>
                    </div>
                </div>

                {/* ── Tab Selector ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100 dark:border-gray-700">
                        {(
                            [
                                { key: 'transactions', icon: Receipt,  label: 'Detail Transaksi', count: payments.length },
                                { key: 'partners',     icon: Building2, label: 'Per Mitra Owner', count: partnerSummary.length },
                            ] as const
                        ).map(({ key, icon: Icon, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                                    tab === key
                                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                <Icon size={15} />
                                {label}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    tab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Tab: Transaksi ── */}
                    {tab === 'transactions' && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner / Mitra</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Durasi</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-14 text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Receipt size={32} className="text-gray-200" />
                                                    <span className="text-sm">Tidak ada transaksi untuk filter ini.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {payments.map((pay, idx) => (
                                        <tr
                                            key={pay.id}
                                            className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {formatDate(pay.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{pay.owner_name}</p>
                                                <p className="text-xs text-gray-400">{pay.owner_email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                                                {pay.order_id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {pay.months ? `${pay.months} bulan` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {formatRp(pay.amount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={pay.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {payments.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-emerald-50 dark:bg-emerald-900/20 border-t-2 border-emerald-200">
                                            <td colSpan={5} className="px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-300 text-right">
                                                Total Pendapatan Berhasil
                                            </td>
                                            <td className="px-4 py-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                                                {formatRp(stats.successRevenue)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}

                    {/* ── Tab: Per Mitra ── */}
                    {tab === 'partners' && (
                        <div className="p-6 space-y-4">
                            {partnerSummary.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <Building2 size={32} className="mx-auto mb-2 text-gray-200" />
                                    <p className="text-sm">Tidak ada data mitra untuk periode ini.</p>
                                </div>
                            )}
                            {partnerSummary.map((ps) => {
                                const barPct = (ps.total_paid / maxPartnerPaid) * 100;
                                return (
                                    <div
                                        key={ps.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {ps.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{ps.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{ps.email}</p>
                                                </div>
                                                <div className="text-right shrink-0 ml-4">
                                                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{formatRp(ps.total_paid)}</p>
                                                    <p className="text-[10px] text-gray-400">{ps.transaction_count} transaksi</p>
                                                </div>
                                            </div>
                                            {/* Bar */}
                                            <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                    style={{ width: `${barPct}%` }}
                                                />
                                            </div>
                                        </div>
                                        {/* Status */}
                                        <div className="shrink-0 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                ps.subscription_status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {ps.subscription_status === 'active'
                                                    ? <><BadgeCheck size={10} /> Aktif</>
                                                    : <><XCircle size={10} /> Nonaktif</>
                                                }
                                            </span>
                                            {ps.subscription_ends_at && (
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    hingga {formatDate(ps.subscription_ends_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer summary */}
                    {payments.length > 0 && tab === 'transactions' && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                {payments.length} transaksi ditampilkan
                            </p>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Berhasil: {payments.filter((p) => p.status === 'success').length}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending: {payments.filter((p) => p.status === 'pending').length}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-400" /> Gagal: {payments.filter((p) => p.status === 'failed').length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
