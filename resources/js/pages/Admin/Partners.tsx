import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Handshake,
    CheckCircle2,
    XCircle,
    Edit3,
    CalendarPlus,
    ChevronDown,
    Building2,
    BadgePercent,
    AlertTriangle,
    Save,
    X,
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
                                {new Date(partner.subscription_ends_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </span>
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Durasi Perpanjangan
                        </label>
                        <div className="grid grid-cols-3 gap-2">
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPartners({ partners, flash }: Props) {
    const [editingCommission, setEditingCommission] = useState<number | null>(null);
    const [renewingPartner, setRenewingPartner] = useState<Partner | null>(null);

    const handleDeactivate = (partner: Partner) => {
        if (confirm(`Nonaktifkan langganan ${partner.name}?`)) {
            router.patch(`/admin/partners/${partner.id}/deactivate`);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    const isExpired = (dateStr: string | null) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    const daysLeft = (dateStr: string | null) => {
        if (!dateStr) return null;
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
        return diff;
    };

    const activeCount = partners.filter((p) => p.subscription_status === 'active' && !isExpired(p.subscription_ends_at)).length;

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

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Mitra & Monetisasi</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Atur komisi dan langganan untuk setiap partner Owner.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-right bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2">
                            <p className="text-xs text-gray-500">Mitra Aktif</p>
                            <p className="text-xl font-bold text-emerald-600">{activeCount} / {partners.length}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
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
                                        Berakhir
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            Belum ada mitra owner.
                                        </td>
                                    </tr>
                                )}
                                {partners.map((partner) => {
                                    const days = daysLeft(partner.subscription_ends_at);
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

                                            {/* Berakhir */}
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className={`text-sm font-medium ${expired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {formatDate(partner.subscription_ends_at)}
                                                    </p>
                                                    {days !== null && days <= 7 && days >= 0 && (
                                                        <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                                                            <AlertTriangle size={11} /> {days} hari lagi
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
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
                </div>
            </div>

            {/* Renew Modal */}
            {renewingPartner && (
                <RenewModal
                    partner={renewingPartner}
                    onClose={() => setRenewingPartner(null)}
                />
            )}
        </>
    );
}
