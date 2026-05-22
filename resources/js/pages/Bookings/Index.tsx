import { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle, Clock, XCircle, MapPin, Calendar,
    CreditCard, RefreshCw, AlertTriangle, Zap,
    FileText, Printer, X, QrCode,
} from 'lucide-react';

// ── Global Snap type (already declared in app, keep in sync) ──────────────────
declare global {
    interface Window {
        snap: {
            pay: (token: string, opts: {
                onSuccess?: (r: MidtransResult) => void;
                onPending?: (r: MidtransResult) => void;
                onError?: (r: MidtransResult) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

interface MidtransResult {
    order_id: string;
    transaction_status: string;
    [key: string]: unknown;
}

interface Booking {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    admin_fee?: number;
    status: string;
    snap_token?: string | null;
    booking_code?: string | null;
    court: {
        id: number;
        name: string;
        type: string;
        venue: {
            id: number;
            name: string;
            address: string;
        };
    };
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    bookings: Booking[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */
const sportIcons: Record<string, string> = {
    futsal: '⚽', badminton: '🏸', basket: '🏀', basketball: '🏀',
    tennis: '🎾', voli: '🏐', volleyball: '🏐',
};
const getSportIcon = (type: string) => sportIcons[type?.toLowerCase()] || '🏟️';

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const formatDateShort = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const calcDuration = (start: string, end: string) => {
    const diff = (new Date(`1970-01-01T${end}`) as any) - (new Date(`1970-01-01T${start}`) as any);
    return Math.round(diff / 3_600_000);
};

/* ------------------------------------------------------------------ */
/* Status Badge                                                          */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { bg: string; text: string; icon: React.ElementType; label: string; spin?: boolean }> = {
        pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock,        label: 'Menunggu Pembayaran' },
        confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle,  label: 'Terkonfirmasi' },
        completed: { bg: 'bg-slate-100',   text: 'text-slate-700',   icon: CheckCircle,  label: 'Selesai' },
        cancelled: { bg: 'bg-red-100',     text: 'text-red-700',     icon: XCircle,      label: 'Dibatalkan' },
        rejected:  { bg: 'bg-red-100',     text: 'text-red-700',     icon: XCircle,      label: 'Ditolak' },
    };
    const c = cfg[status] ?? cfg.pending;
    const Icon = c.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${c.bg} ${c.text}`}>
            <Icon size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">{c.label}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Receipt Modal (Struk Digital)                                         */
/* ------------------------------------------------------------------ */
function ReceiptModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
    const duration  = calcDuration(booking.start_time, booking.end_time);
    const pricePerHour = duration > 0 ? Math.round(booking.total_price / duration) : booking.total_price;
    const adminFee  = booking.admin_fee ?? 0;
    const subTotal  = booking.total_price;
    const now       = new Date();

    const handlePrint = () => window.print();

    return (
        <>
            {/* ── Print-only CSS (injected via <style>) ── */}
            <style>{`
                @media print {
                    body > *:not(#receipt-print-area) { display: none !important; }
                    #receipt-print-area {
                        display: block !important;
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        background: white;
                        padding: 24px;
                    }
                    #receipt-modal-overlay { display: none !important; }
                    .no-print { display: none !important; }
                    @page { margin: 0.5cm; size: A5; }
                }
            `}</style>

            {/* Overlay */}
            <div
                id="receipt-modal-overlay"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
                onClick={onClose}
            />

            {/* ── Receipt Card ── */}
            <div
                id="receipt-print-area"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
                <div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 pt-8 pb-10 text-white text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -left-6 bottom-0 w-24 h-24 rounded-full bg-teal-400/20" />

                        <div className="relative">
                            {/* App Brand */}
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">LapanganPro</p>
                            <p className="text-emerald-200 text-xs">Struk Pemesanan Digital</p>

                            {/* LUNAS Badge */}
                            <div className="my-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2">
                                <CheckCircle size={18} className="text-emerald-200" />
                                <span className="font-extrabold text-lg tracking-widest">LUNAS</span>
                            </div>

                            {/* Booking Code */}
                            <div className="mt-1">
                                <p className="text-emerald-200 text-xs font-semibold mb-0.5">Kode Booking</p>
                                <p className="font-mono font-extrabold text-2xl tracking-widest text-white drop-shadow">
                                    {booking.booking_code}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Zigzag Divider ── */}
                    <div className="flex" aria-hidden>
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={i} className={`flex-1 h-4 ${i % 2 === 0 ? 'bg-white' : 'bg-emerald-500'}`}
                                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                        ))}
                    </div>

                    <div className="px-8 pb-6 space-y-5">

                        {/* ── Booking Detail ── */}
                        <section>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                <Calendar size={12} /> Detail Jadwal
                            </p>
                            <dl className="space-y-2 text-sm">
                                <Row label="Tempat" value={booking.court.venue.name} />
                                <Row label="Lapangan" value={`${getSportIcon(booking.court.type)} ${booking.court.name}`} />
                                <Row label="Tanggal" value={formatDateShort(booking.booking_date)} />
                                <Row label="Jam" value={`${booking.start_time} – ${booking.end_time}`} />
                                <Row label="Durasi" value={`${duration} jam`} />
                            </dl>
                        </section>

                        <div className="border-t border-dashed border-gray-200" />

                        {/* ── Customer Detail ── */}
                        {booking.user && (
                            <section>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Detail Pemesan</p>
                                <dl className="space-y-2 text-sm">
                                    <Row label="Nama" value={booking.user.name} />
                                    <Row label="Email" value={booking.user.email} />
                                </dl>
                            </section>
                        )}

                        <div className="border-t border-dashed border-gray-200" />

                        {/* ── Cost Breakdown ── */}
                        <section>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Rincian Biaya</p>
                            <dl className="space-y-2 text-sm">
                                <Row label={`Harga (${duration} jam × ${formatRp(pricePerHour)})`} value={formatRp(subTotal)} />
                                {adminFee > 0 && (
                                    <Row label="Biaya Layanan Platform" value={formatRp(adminFee)} muted />
                                )}
                                <Row label="Metode Pembayaran" value="Midtrans" />
                            </dl>
                            {/* Total */}
                            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex justify-between items-center">
                                <span className="text-sm font-bold text-emerald-800">Total Dibayar</span>
                                <span className="text-xl font-extrabold text-emerald-700">{formatRp(subTotal)}</span>
                            </div>
                        </section>

                        {/* ── Footer ── */}
                        <div className="text-center pt-1">
                            <p className="text-xs text-gray-400">
                                Dicetak: {now.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-400">Terima kasih telah menggunakan LapanganPro! 🏟️</p>
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex gap-3 pt-2 no-print">
                            <button
                                onClick={handlePrint}
                                id="btn-print-receipt"
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-emerald-500/50 transition-all"
                            >
                                <Printer size={16} /> Cetak Struk
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Close button top-right (screen only) */}
                    <button
                        onClick={onClose}
                        className="no-print absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <dt className="text-gray-500 shrink-0">{label}</dt>
            <dd className={`font-semibold text-right ${muted ? 'text-gray-400' : 'text-gray-800'}`}>{value}</dd>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                        */
/* ------------------------------------------------------------------ */
export default function BookingsIndex({ bookings }: Props) {
    const [payingId, setPayingId]     = useState<number | null>(null);
    const [receiptBook, setReceiptBook] = useState<Booking | null>(null);
    const [notification, setNotif]    = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null);
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const showNotif = (type: 'success' | 'warning' | 'error', msg: string) => {
        setNotif({ type, msg });
        setTimeout(() => setNotif(null), 6000);
    };

    const handlePayNow = (booking: Booking) => {
        if (!booking.snap_token) { showNotif('error', 'Token pembayaran tidak tersedia.'); return; }
        if (!window.snap)         { showNotif('error', 'Midtrans belum termuat. Refresh halaman.'); return; }
        setPayingId(booking.id);
        window.snap.pay(booking.snap_token, {
            onSuccess: () => { setPayingId(null); showNotif('success', '🎉 Pembayaran berhasil! Status telah diperbarui.'); router.reload({ only: ['bookings'] }); },
            onPending: () => { setPayingId(null); showNotif('warning', '⏳ Pembayaran sedang diproses.'); router.reload({ only: ['bookings'] }); },
            onError:   () => { setPayingId(null); showNotif('error', 'Pembayaran gagal. Silakan coba lagi.'); },
            onClose:   () => { setPayingId(null); },
        });
    };

    const notifStyle = {
        success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle, ic: 'text-emerald-500' },
        warning: { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-800',   icon: AlertTriangle, ic: 'text-amber-500' },
        error:   { bg: 'bg-red-50 border-red-200',         text: 'text-red-800',     icon: XCircle, ic: 'text-red-500' },
    };

    return (
        <>
            <Head title="Riwayat Pesanan" />

            {/* Print area lives outside the modal DOM so @media print can target it cleanly */}
            {receiptBook && (
                <ReceiptModal
                    booking={receiptBook}
                    onClose={() => setReceiptBook(null)}
                />
            )}

            <div className="min-h-screen bg-slate-50 pb-20">
                {/* ── Header Banner ── */}
                <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-16 sm:py-20 overflow-hidden">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Riwayat Pesanan Saya</h1>
                        <p className="mt-3 text-lg text-emerald-50 max-w-2xl">
                            Kelola semua transaksi pemesanan lapangan olahraga Anda di satu tempat.
                        </p>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

                    {/* Flash / Notification */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3 shadow-sm">
                            <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
                            <p className="text-sm font-semibold text-emerald-800">{flash.success}</p>
                        </div>
                    )}
                    {notification && (() => {
                        const s = notifStyle[notification.type];
                        const Icon = s.icon;
                        return (
                            <div className={`mb-6 rounded-xl border p-4 flex items-start gap-3 shadow-sm ${s.bg}`}>
                                <Icon className={`mt-0.5 shrink-0 ${s.ic}`} size={20} />
                                <p className={`text-sm font-semibold ${s.text}`}>{notification.msg}</p>
                            </div>
                        );
                    })()}

                    {/* ── Booking List ── */}
                    {bookings.length > 0 ? (
                        <div className="space-y-6">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left: Detail */}
                                        <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl group-hover:scale-110 transition-transform">
                                                        {getSportIcon(booking.court.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-800">{booking.court.name}</h3>
                                                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                            <MapPin size={14} className="text-emerald-500" />
                                                            {booking.court.venue.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="md:hidden"><StatusBadge status={booking.status} /></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 rounded-xl p-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12} /> Tanggal</p>
                                                    <p className="text-sm font-semibold text-slate-700">{formatDate(booking.booking_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Clock size={12} /> Waktu</p>
                                                    <p className="text-sm font-semibold text-slate-700">{booking.start_time} – {booking.end_time}</p>
                                                </div>
                                            </div>

                                            {/* Booking Code Badge (jika sudah confirmed) */}
                                            {booking.booking_code && (
                                                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                                                    <QrCode size={13} className="text-emerald-600" />
                                                    <span className="font-mono text-xs font-bold text-emerald-700 tracking-wider">{booking.booking_code}</span>
                                                </div>
                                            )}

                                            <p className="mt-3 text-xs text-slate-400">ID Pesanan: #{booking.id}</p>
                                        </div>

                                        {/* Right: Payment & Action */}
                                        <div className="p-6 md:w-80 flex flex-col justify-center bg-slate-50/50">
                                            <div className="hidden md:flex justify-end mb-6">
                                                <StatusBadge status={booking.status} />
                                            </div>

                                            <div className="mb-6 md:text-right">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Pembayaran</p>
                                                <p className="text-2xl font-extrabold text-slate-900">{formatRp(booking.total_price)}</p>
                                            </div>

                                            <div className="mt-auto space-y-3">
                                                {/* Tombol Lihat Struk — hanya saat confirmed */}
                                                {booking.status === 'confirmed' && booking.booking_code && (
                                                    <button
                                                        id={`btn-receipt-${booking.id}`}
                                                        onClick={() => setReceiptBook(booking)}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2"
                                                    >
                                                        <FileText size={17} />
                                                        Lihat Struk
                                                    </button>
                                                )}

                                                {/* Tombol Bayar — saat pending & ada snap_token */}
                                                {booking.status === 'pending' && booking.snap_token && (
                                                    <button
                                                        id={`pay-btn-${booking.id}`}
                                                        onClick={() => handlePayNow(booking)}
                                                        disabled={payingId === booking.id}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                                    >
                                                        {payingId === booking.id
                                                            ? <><RefreshCw size={17} className="animate-spin" /> Memuat...</>
                                                            : <><Zap size={17} /> Bayar Sekarang</>
                                                        }
                                                    </button>
                                                )}

                                                {booking.status === 'pending' && !booking.snap_token && (
                                                    <div className="w-full py-3 px-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                                                        <AlertTriangle size={16} /> Token Pembayaran Tidak Tersedia
                                                    </div>
                                                )}

                                                {booking.status === 'cancelled' && (
                                                    <div className="w-full py-3 px-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                                                        <XCircle size={16} /> Pesanan Dibatalkan
                                                    </div>
                                                )}

                                                <Link
                                                    href="/venues"
                                                    className="w-full py-2.5 px-4 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <CreditCard size={16} className="text-slate-400" /> Pesan Lapangan Lain
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                <Calendar size={36} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-800">Belum Ada Pesanan</h3>
                            <p className="mb-8 text-slate-500">Anda belum pernah melakukan pemesanan lapangan.</p>
                            <Link
                                href="/venues"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
                            >
                                Cari Lapangan Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
