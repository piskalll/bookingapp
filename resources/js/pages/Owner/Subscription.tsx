import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Calendar,
    RefreshCw,
    Zap,
    ShieldCheck,
    AlertTriangle,
    CreditCard,
    Clock,
    Sparkles,
} from 'lucide-react';

// ── Deklarasi tipe global untuk Midtrans Snap ─────────────────────────────────
declare global {
    interface Window {
        snap: {
            pay: (
                snapToken: string,
                options: {
                    onSuccess?: (result: MidtransResult) => void;
                    onPending?: (result: MidtransResult) => void;
                    onError?: (result: MidtransResult) => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

interface MidtransResult {
    order_id: string;
    transaction_status: string;
    [key: string]: unknown;
}

interface Props {
    subscription_status: 'active' | 'inactive';
    subscription_ends_at: string | null; // format: YYYY-MM-DD
}

// ── Helper ────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatRp(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// ── Notification Bar ──────────────────────────────────────────────────────────
type NotifType = 'success' | 'warning' | 'error';
interface Notification {
    type: NotifType;
    message: string;
}

const notifStyle: Record<NotifType, { bg: string; text: string; icon: React.ElementType; iconColor: string }> = {
    success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle,  iconColor: 'text-emerald-500' },
    warning: { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-800',   icon: AlertTriangle, iconColor: 'text-amber-500'   },
    error:   { bg: 'bg-red-50 border-red-200',         text: 'text-red-800',     icon: XCircle,       iconColor: 'text-red-500'     },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function OwnerSubscription({ subscription_status, subscription_ends_at }: Props) {
    const [loading, setLoading]       = useState(false);
    const [notification, setNotif]    = useState<Notification | null>(null);

    const isActive = subscription_status === 'active';

    const showNotif = (type: NotifType, message: string) => {
        setNotif({ type, message });
        setTimeout(() => setNotif(null), 7000);
    };

    // ── Hit endpoint pay() → dapatkan snap_token → buka Snap popup ──
    const handleRenew = async () => {
        if (typeof window.snap === 'undefined') {
            showNotif('error', 'Midtrans Snap belum termuat. Pastikan koneksi internet Anda stabil lalu refresh halaman.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/owner/subscription/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message ?? 'Gagal membuat sesi pembayaran.');
            }

            const data = await res.json();
            const snapToken: string = data.snap_token;

            window.snap.pay(snapToken, {
                onSuccess: () => {
                    setLoading(false);
                    showNotif('success', '🎉 Pembayaran berhasil! Langganan Anda telah diperpanjang 30 hari.');
                    // Reload halaman agar data subscription_ends_at dan status diperbarui dari server
                    router.reload({ only: ['subscription_status', 'subscription_ends_at'] });
                },
                onPending: () => {
                    setLoading(false);
                    showNotif('warning', '⏳ Pembayaran sedang diproses. Selesaikan sesuai instruksi yang diberikan.');
                },
                onError: () => {
                    setLoading(false);
                    showNotif('error', 'Pembayaran gagal. Silakan coba kembali.');
                },
                onClose: () => {
                    setLoading(false);
                },
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.';
            showNotif('error', message);
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Billing & Langganan" />

            <div className="flex-1 space-y-6 p-6">

                {/* ── Notification Bar ── */}
                {notification && (() => {
                    const s = notifStyle[notification.type];
                    const Icon = s.icon;
                    return (
                        <div className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm animate-in fade-in slide-in-from-top-2 ${s.bg}`}>
                            <Icon className={`mt-0.5 shrink-0 ${s.iconColor}`} size={20} />
                            <p className={`text-sm font-semibold ${s.text}`}>{notification.message}</p>
                        </div>
                    );
                })()}

                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Billing &amp; Langganan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kelola status langganan dan perpanjangan akun Owner Anda.
                    </p>
                </div>

                {/* ── Layout Grid ── */}
                <div className="grid gap-6 lg:grid-cols-5">

                    {/* ── Kartu Status Saat Ini (kiri, 2 kolom) ── */}
                    <div className="lg:col-span-2">
                        <div className={`relative overflow-hidden rounded-2xl border shadow-sm p-6 h-full flex flex-col justify-between transition-all ${
                            isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                            {/* Background decoration */}
                            {isActive && (
                                <>
                                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                                    <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-teal-400/20" />
                                </>
                            )}

                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs font-bold uppercase tracking-widest ${
                                        isActive ? 'text-emerald-100' : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                        Status Langganan
                                    </p>
                                    {isActive
                                        ? <ShieldCheck size={20} className="text-emerald-200" />
                                        : <XCircle size={20} className="text-gray-300 dark:text-gray-600" />
                                    }
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {isActive
                                            ? <><CheckCircle size={15} /> Aktif</>
                                            : <><XCircle size={15} /> Tidak Aktif</>
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="relative mt-6">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${
                                    isActive ? 'text-emerald-200' : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    <Calendar size={12} className="inline mr-1" />
                                    Berlaku Sampai
                                </p>
                                <p className={`mt-1 text-xl font-extrabold ${
                                    isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                                }`}>
                                    {isActive && subscription_ends_at
                                        ? formatDate(subscription_ends_at)
                                        : <span className="text-gray-400 dark:text-gray-500 text-base font-medium">Belum Berlangganan</span>
                                    }
                                </p>

                                {/* Countdown days remaining */}
                                {isActive && subscription_ends_at && (() => {
                                    const daysLeft = Math.max(0, Math.ceil(
                                        (new Date(subscription_ends_at).getTime() - Date.now()) / 86_400_000
                                    ));
                                    return (
                                        <p className="mt-1 text-sm text-emerald-200 flex items-center gap-1">
                                            <Clock size={13} />
                                            {daysLeft} hari tersisa
                                        </p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* ── Kartu Paket Langganan (kanan, 3 kolom) ── */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden h-full flex flex-col">
                            {/* Card Header */}
                            <div className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 px-6 py-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-500" />
                                <h2 className="font-bold text-gray-900 dark:text-white">Paket Langganan Owner</h2>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                {/* Plan Details */}
                                <div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                            {formatRp(50000)}
                                        </span>
                                        <span className="mb-1 text-sm font-medium text-gray-400">/30 hari</span>
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Perpanjang akses penuh platform selama 30 hari ke depan. Pembayaran diproses secara aman melalui Midtrans.
                                    </p>

                                    {/* Feature list */}
                                    <ul className="mt-5 space-y-2.5">
                                        {[
                                            'Kelola venue & lapangan tanpa batas',
                                            'Terima pesanan dari customer secara real-time',
                                            'Akses laporan pendapatan bulanan',
                                            'Dukungan semua metode pembayaran Midtrans',
                                        ].map((feat) => (
                                            <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                                <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <div className="mt-8">
                                    <button
                                        id="btn-renew-subscription"
                                        onClick={handleRenew}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                Memuat Pembayaran...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} />
                                                Perpanjang 30 Hari — {formatRp(50000)}
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                        <CreditCard size={13} />
                                        Pembayaran aman &amp; terenkripsi via Midtrans
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Riwayat Perpanjangan (informatif) ── */}
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                        Catatan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Jika masa aktif masih berjalan, perpanjangan akan ditambahkan dari tanggal berakhir saat ini (bukan dari hari ini). Anda dapat memperpanjang kapan saja tanpa khawatir kehilangan sisa masa aktif.
                    </p>
                </div>

            </div>
        </>
    );
}
