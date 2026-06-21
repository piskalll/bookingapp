import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Handshake,
    CheckCircle2,
    XCircle,
    Edit3,
    CalendarPlus,
    Building2,
    BadgePercent,
    AlertTriangle,
    Save,
    X,
    Clock,
    TrendingUp,
    Users,
    Activity,
    Timer,
    BarChart3,
    RefreshCw,
    CalendarClock,
    ShieldCheck,
    ShieldOff,
} from 'lucide-react';

interface Partner {
    id: number;
    name: string;
    email: string;
    commission_rate: number;
    subscription_status: 'active' | 'inactive';
    subscription_ends_at: string | null;
    venues_count: number;
}

interface Props {
    partners: Partner[];
    flash?: { success?: string; error?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
};

const formatDateFull = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
};

const isExpired = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
};

const daysLeft = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
};

// ── Inline form: edit komisi ──────────────────────────────────────────────────
function CommissionForm({ partner, onClose }: { partner: Partner; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({
        commission_rate: partner.commission_rate,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/partners/${partner.id}/commission`, {
            onSuccess: onClose,
        });
    };

    return (
        <form onSubmit={submit} className="flex items-center gap-2">
            <div className="relative">
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={data.commission_rate}
                    onChange={(e) => setData('commission_rate', parseFloat(e.target.value))}
                    className="w-24 rounded-lg border border-violet-300 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-gray-800 dark:border-violet-600 dark:text-white"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
            </div>
            <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-60"
            >
                <Save size={13} /> Simpan
            </button>
            <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                <X size={15} />
            </button>
            {errors.commission_rate && <p className="text-xs text-red-500">{errors.commission_rate}</p>}
        </form>
    );
}

// ── Modal perpanjang langganan ────────────────────────────────────────────────
function RenewModal({ partner, onClose }: { partner: Partner; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ months: 1 });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/partners/${partner.id}/renew`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Perpanjang Langganan</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{partner.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                        <X size={18} />
                    </button>
                </div>

                {partner.subscription_ends_at && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Langganan aktif hingga:{' '}
                            <span className="font-semibold">
                                {formatDateFull(partner.subscription_ends_at)}
                            </span>
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Durasi Perpanjangan
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 3, 6, 12].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setData('months', m)}
                                    className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                                        data.months === m
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                                    }`}
                                >
                                    {m} bln
                                </button>
                            ))}
                        </div>
                        {errors.months && <p className="text-xs text-red-500 mt-1">{errors.months}</p>}
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan...' : 'Perpanjang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Subscription Detail Modal ─────────────────────────────────────────────────
function SubscriptionDetailModal({ partner, onClose, onRenew, onDeactivate }: {
    partner: Partner;
    onClose: () => void;
    onRenew: () => void;
    onDeactivate: () => void;
}) {
    const days = daysLeft(partner.subscription_ends_at);
    const expired = isExpired(partner.subscription_ends_at);
    const isActive = partner.subscription_status === 'active' && !expired;

    // Progress bar: how much of the subscription is "remaining" (assumes monthly cycle)
    const progressPct = (() => {
        if (!partner.subscription_ends_at || !isActive || days === null) return 0;
        const totalDays = 30; // rough estimate per month
        return Math.max(0, Math.min(100, Math.round((days / totalDays) * 100)));
    })();

    const urgencyColor = days !== null && days <= 3
        ? 'text-red-600'
        : days !== null && days <= 7
        ? 'text-amber-600'
        : 'text-emerald-600';

    const progressColor = days !== null && days <= 3
        ? 'bg-red-500'
        : days !== null && days <= 7
        ? 'bg-amber-500'
        : 'bg-emerald-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-8 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
                    <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full bg-emerald-500/10" />
                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {partner.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight">{partner.name}</h3>
                                <p className="text-slate-400 text-xs mt-0.5">{partner.email}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
                            <X size={18} />
                        </button>
                    </div>
                    {/* Status badge */}
                    <div className="relative mt-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                            {isActive ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}
                            {isActive ? 'Langganan Aktif' : expired ? 'Expired' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">

                    {/* Subscription Timeline */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <CalendarClock size={12} /> Timeline Langganan
                        </p>

                        {/* Progress bar */}
                        {isActive && partner.subscription_ends_at && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Sisa Waktu</span>
                                    <span className={`text-xs font-bold ${urgencyColor}`}>
                                        {days !== null && days >= 0 ? `${days} hari lagi` : 'Expired'}
                                    </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${progressColor}`}
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Berakhir</p>
                                <p className={`text-sm font-bold ${expired ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                                    {formatDate(partner.subscription_ends_at)}
                                </p>
                                {partner.subscription_ends_at && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDateFull(partner.subscription_ends_at)}</p>
                                )}
                            </div>
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Komisi</p>
                                <p className="text-sm font-bold text-violet-700 dark:text-violet-400">
                                    {partner.commission_rate}%
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">per transaksi</p>
                            </div>
                        </div>

                        {/* Venue count */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-3">
                            <Building2 size={16} className="text-blue-500 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{partner.venues_count} Venue Terdaftar</p>
                                <p className="text-[10px] text-blue-500">Total lapangan yang dikelola</p>
                            </div>
                        </div>

                        {/* Warning if expiring soon */}
                        {days !== null && days >= 0 && days <= 7 && isActive && (
                            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    Langganan akan berakhir dalam <strong>{days} hari</strong>. Segera perpanjang untuk menghindari gangguan layanan.
                                </p>
                            </div>
                        )}

                        {/* Warning if expired */}
                        {expired && (
                            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700">
                                    Langganan telah <strong>berakhir</strong>. Perpanjang untuk mengaktifkan kembali layanan mitra.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onRenew}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                            <CalendarPlus size={15} /> Perpanjang
                        </button>
                        {isActive && (
                            <button
                                onClick={onDeactivate}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
                            >
                                <XCircle size={15} /> Nonaktifkan
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    return (
        <div className={`rounded-2xl border p-5 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100')}`}>
                    <Icon size={20} className={color} />
                </div>
            </div>
        </div>
    );
}

// ── Subscription Timeline Bar ─────────────────────────────────────────────────
function SubscriptionTimeline({ partners }: { partners: Partner[] }) {
    const sorted = [...partners]
        .filter((p) => p.subscription_ends_at)
        .sort((a, b) => new Date(a.subscription_ends_at!).getTime() - new Date(b.subscription_ends_at!).getTime());

    if (sorted.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={16} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Timeline Berakhirnya Langganan</h3>
            </div>
            <div className="space-y-3">
                {sorted.map((partner) => {
                    const days = daysLeft(partner.subscription_ends_at);
                    const expired = isExpired(partner.subscription_ends_at);
                    const isActive = partner.subscription_status === 'active' && !expired;

                    const barColor = expired
                        ? 'bg-red-400'
                        : days !== null && days <= 3
                        ? 'bg-red-500'
                        : days !== null && days <= 7
                        ? 'bg-amber-400'
                        : days !== null && days <= 30
                        ? 'bg-yellow-400'
                        : 'bg-emerald-500';

                    const maxDays = 365;
                    const barPct = expired
                        ? 0
                        : days !== null
                        ? Math.min(100, Math.round((days / maxDays) * 100))
                        : 0;

                    const statusText = expired
                        ? 'Expired'
                        : !isActive
                        ? 'Nonaktif'
                        : days !== null && days <= 7
                        ? `⚠️ ${days} hari`
                        : `${days} hari lagi`;

                    const statusColor = expired
                        ? 'text-red-500'
                        : !isActive
                        ? 'text-gray-400'
                        : days !== null && days <= 7
                        ? 'text-amber-600'
                        : 'text-emerald-600';

                    return (
                        <div key={partner.id} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {partner.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{partner.name}</span>
                                    <span className={`text-[10px] font-bold ml-2 shrink-0 ${statusColor}`}>{statusText}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div
                                        className={`h-full rounded-full transition-all ${barColor}`}
                                        style={{ width: `${barPct}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0 min-w-[56px] text-right">
                                {formatDate(partner.subscription_ends_at)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPartners({ partners, flash }: Props) {
    const [editingCommission, setEditingCommission] = useState<number | null>(null);
    const [renewingPartner, setRenewingPartner]     = useState<Partner | null>(null);
    const [detailPartner, setDetailPartner]         = useState<Partner | null>(null);
    const [filterStatus, setFilterStatus]           = useState<'all' | 'active' | 'inactive' | 'expiring'>('all');

    const handleDeactivate = (partner: Partner) => {
        if (confirm(`Nonaktifkan langganan ${partner.name}?`)) {
            router.patch(`/admin/partners/${partner.id}/deactivate`);
            setDetailPartner(null);
        }
    };

    // ── Computed stats ──
    const stats = useMemo(() => {
        const now = new Date();
        const active   = partners.filter((p) => p.subscription_status === 'active' && !isExpired(p.subscription_ends_at));
        const expired  = partners.filter((p) => isExpired(p.subscription_ends_at));
        const expiring = partners.filter((p) => {
            const d = daysLeft(p.subscription_ends_at);
            return d !== null && d >= 0 && d <= 7 && p.subscription_status === 'active';
        });
        const inactive = partners.filter((p) => p.subscription_status === 'inactive' && !isExpired(p.subscription_ends_at));
        return { total: partners.length, active: active.length, expired: expired.length, expiring: expiring.length, inactive: inactive.length };
    }, [partners]);

    // ── Filtered partners ──
    const filteredPartners = useMemo(() => {
        if (filterStatus === 'all') return partners;
        if (filterStatus === 'active') return partners.filter((p) => p.subscription_status === 'active' && !isExpired(p.subscription_ends_at));
        if (filterStatus === 'inactive') return partners.filter((p) => p.subscription_status === 'inactive' || isExpired(p.subscription_ends_at));
        if (filterStatus === 'expiring') return partners.filter((p) => {
            const d = daysLeft(p.subscription_ends_at);
            return d !== null && d >= 0 && d <= 7 && p.subscription_status === 'active';
        });
        return partners;
    }, [partners, filterStatus]);

    return (
        <>
            <Head title="Kelola Mitra & Monetisasi" />

            <div className="p-6 space-y-6">
                {/* Flash message */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                        <CheckCircle2 size={16} className="shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        <XCircle size={16} className="shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Handshake size={22} className="text-emerald-600" />
                            Kelola Mitra &amp; Monetisasi
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Atur komisi dan langganan untuk setiap partner Owner.
                        </p>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users}
                        label="Total Mitra"
                        value={stats.total}
                        sub="owner terdaftar"
                        color="text-blue-600"
                    />
                    <StatCard
                        icon={ShieldCheck}
                        label="Aktif"
                        value={stats.active}
                        sub={`${Math.round((stats.active / (stats.total || 1)) * 100)}% dari total`}
                        color="text-emerald-600"
                    />
                    <StatCard
                        icon={Timer}
                        label="Segera Berakhir"
                        value={stats.expiring}
                        sub="dalam 7 hari ke depan"
                        color={stats.expiring > 0 ? 'text-amber-600' : 'text-gray-400'}
                    />
                    <StatCard
                        icon={ShieldOff}
                        label="Expired / Nonaktif"
                        value={stats.expired + stats.inactive}
                        sub="perlu perhatian"
                        color={stats.expired + stats.inactive > 0 ? 'text-red-600' : 'text-gray-400'}
                    />
                </div>

                {/* ── Subscription Timeline ── */}
                <SubscriptionTimeline partners={partners} />

                {/* ── Laporan Langganan Section ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Section header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-emerald-600" />
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Laporan Langganan Mitra</h2>
                        </div>
                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            {(
                                [
                                    { key: 'all',      label: 'Semua',   count: stats.total },
                                    { key: 'active',   label: 'Aktif',   count: stats.active },
                                    { key: 'expiring', label: '⚠️ Segera', count: stats.expiring },
                                    { key: 'inactive', label: 'Nonaktif', count: stats.expired + stats.inactive },
                                ] as const
                            ).map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        filterStatus === key
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {label}
                                    {count > 0 && (
                                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            filterStatus === key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Venue
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Komisi (%)
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status Langganan
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Berakhir &amp; Sisa
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPartners.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={32} className="text-gray-200" />
                                                <span className="text-sm">Tidak ada mitra untuk filter ini.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredPartners.map((partner) => {
                                    const days    = daysLeft(partner.subscription_ends_at);
                                    const expired = isExpired(partner.subscription_ends_at);
                                    const isActive = partner.subscription_status === 'active' && !expired;

                                    return (
                                        <tr
                                            key={partner.id}
                                            className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            {/* Owner info */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                        {partner.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{partner.name}</p>
                                                        <p className="text-xs text-gray-400">{partner.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Venue count */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                    <Building2 size={14} className="text-gray-400" />
                                                    {partner.venues_count} venue
                                                </span>
                                            </td>

                                            {/* Komisi */}
                                            <td className="px-5 py-4">
                                                {editingCommission === partner.id ? (
                                                    <CommissionForm
                                                        partner={partner}
                                                        onClose={() => setEditingCommission(null)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                                            <BadgePercent size={11} />
                                                            {partner.commission_rate}%
                                                        </span>
                                                        <button
                                                            onClick={() => setEditingCommission(partner.id)}
                                                            className="p-1 text-gray-400 hover:text-violet-600 transition rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                                            title="Edit komisi"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                        <CheckCircle2 size={12} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                        <XCircle size={12} /> {expired ? 'Expired' : 'Nonaktif'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Berakhir + sisa waktu */}
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className={`text-sm font-medium ${expired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {formatDate(partner.subscription_ends_at)}
                                                    </p>
                                                    {/* Sisa waktu badge */}
                                                    {partner.subscription_ends_at && (
                                                        <div className="mt-1">
                                                            {expired ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                                                                    <Clock size={9} /> Sudah berakhir
                                                                </span>
                                                            ) : days !== null && days <= 3 ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                                                                    <AlertTriangle size={9} /> {days} hari lagi!
                                                                </span>
                                                            ) : days !== null && days <= 7 ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                                                                    <AlertTriangle size={9} /> {days} hari lagi
                                                                </span>
                                                            ) : days !== null && days <= 30 ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600">
                                                                    <Clock size={9} /> {days} hari lagi
                                                                </span>
                                                            ) : days !== null ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                                                                    <TrendingUp size={9} /> {days} hari lagi
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                    {!partner.subscription_ends_at && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Belum diatur</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setDetailPartner(partner)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                        title="Detail langganan"
                                                    >
                                                        <RefreshCw size={12} /> Detail
                                                    </button>
                                                    <button
                                                        onClick={() => setRenewingPartner(partner)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                                    >
                                                        <CalendarPlus size={13} /> Perpanjang
                                                    </button>
                                                    {isActive && (
                                                        <button
                                                            onClick={() => handleDeactivate(partner)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                        >
                                                            <XCircle size={13} /> Nonaktifkan
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer summary */}
                    {filteredPartners.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                Menampilkan <span className="font-semibold text-gray-600 dark:text-gray-300">{filteredPartners.length}</span> dari <span className="font-semibold text-gray-600 dark:text-gray-300">{partners.length}</span> mitra
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Aktif: {stats.active}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    Segera: {stats.expiring}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                    Expired: {stats.expired}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Renew Modal */}
            {renewingPartner && (
                <RenewModal
                    partner={renewingPartner}
                    onClose={() => setRenewingPartner(null)}
                />
            )}

            {/* Detail Modal */}
            {detailPartner && (
                <SubscriptionDetailModal
                    partner={detailPartner}
                    onClose={() => setDetailPartner(null)}
                    onRenew={() => { setDetailPartner(null); setRenewingPartner(detailPartner); }}
                    onDeactivate={() => handleDeactivate(detailPartner)}
                />
            )}
        </>
    );
}
