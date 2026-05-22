import { useState, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import {
    Search, CheckCircle, XCircle, AlertTriangle, Clock,
    MapPin, Calendar, User, Mail, Hash,
    Zap, RefreshCw, ShieldCheck, Ban, Trophy,
    Loader2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookingResult {
    id: number;
    booking_code: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    total_price: number;
    admin_fee: number;
    status: string;
    court_name: string;
    court_type: string;
    venue_name: string;
    venue_address: string;
    customer_name: string;
    customer_email: string;
    created_at: string;
}

type VerifyState = 'idle' | 'loading' | 'valid' | 'invalid';

interface VerifyResponse {
    valid: boolean;
    is_today?: boolean;
    message?: string;
    booking?: BookingResult;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const sportIcons: Record<string, string> = {
    futsal: '⚽', badminton: '🏸', basket: '🏀', basketball: '🏀',
    tennis: '🎾', voli: '🏐', volleyball: '🏐',
};
const getSportIcon = (t: string) => sportIcons[t?.toLowerCase()] || '🏟️';

function getCsrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

// ── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <Icon size={15} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white break-words">{value}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function OwnerVerification() {
    const [code, setCode]       = useState('');
    const [state, setState]     = useState<VerifyState>('idle');
    const [result, setResult]   = useState<VerifyResponse | null>(null);
    const inputRef              = useRef<HTMLInputElement>(null);

    const reset = () => {
        setState('idle');
        setResult(null);
        setCode('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const verify = useCallback(async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        setState('loading');
        setResult(null);

        try {
            const res = await fetch('/owner/bookings/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ booking_code: trimmed }),
            });

            const data: VerifyResponse = await res.json();
            setResult(data);
            setState(data.valid ? 'valid' : 'invalid');
        } catch {
            setResult({ valid: false, message: 'Gagal terhubung ke server. Periksa koneksi Anda.' });
            setState('invalid');
        }
    }, [code]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') verify();
    };

    const booking     = result?.booking;
    const isToday     = result?.is_today ?? false;

    return (
        <>
            <Head title="Verifikasi Pesanan" />

            <div className="flex-1 p-6 space-y-6">

                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifikasi Pesanan</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Scan atau masukkan kode booking customer untuk memverifikasi kehadiran.
                    </p>
                </div>

                {/* ── Search Panel ── */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 px-6 py-4">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            Cek Kode Booking
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="flex gap-3">
                            {/* Input */}
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <Hash size={20} className="text-gray-400" />
                                </div>
                                <input
                                    ref={inputRef}
                                    id="input-booking-code"
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    onKeyDown={handleKeyDown}
                                    placeholder="SPB-20260518-0001"
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-12 pr-4 py-3.5 font-mono text-lg font-bold tracking-widest text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 placeholder:font-normal placeholder:text-base placeholder:tracking-normal focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Verify Button */}
                            <button
                                id="btn-verify-code"
                                onClick={verify}
                                disabled={state === 'loading' || !code.trim()}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none whitespace-nowrap"
                            >
                                {state === 'loading'
                                    ? <><Loader2 size={18} className="animate-spin" /> Memeriksa...</>
                                    : <><Search size={18} /> Verifikasi</>
                                }
                            </button>
                        </div>

                        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                            Format kode: <span className="font-mono font-semibold">SPB-YYYYMMDD-XXXX</span> · Ketik lalu tekan Enter atau klik Verifikasi
                        </p>
                    </div>
                </div>

                {/* ── Result Area ── */}
                {state === 'loading' && (
                    <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
                        <Loader2 size={28} className="animate-spin text-emerald-500" />
                        <p className="text-base font-medium">Sedang memeriksa kode...</p>
                    </div>
                )}

                {/* ── VALID Result ── */}
                {state === 'valid' && booking && (
                    <div className="space-y-4">
                        {/* ─ Big Status Banner ─ */}
                        <div className={`relative overflow-hidden rounded-2xl border-2 p-6 text-center transition-all ${
                            isToday
                                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
                                : 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                        }`}>
                            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 ${isToday ? 'bg-emerald-500' : 'bg-blue-400'}" />

                            <div className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ${
                                isToday
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40'
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/40'
                            }`}>
                                {isToday
                                    ? <CheckCircle size={40} className="text-white" />
                                    : <Clock size={40} className="text-white" />
                                }
                            </div>

                            <h2 className={`text-3xl font-extrabold tracking-wide ${
                                isToday ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'
                            }`}>
                                {isToday ? '✅ VALID — SIAP BERMAIN' : '🕐 VALID — BELUM JADWALNYA'}
                            </h2>
                            <p className={`mt-1 text-sm font-medium ${
                                isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                {isToday
                                    ? 'Kode booking valid dan customer terdaftar main HARI INI.'
                                    : `Kode valid. Jadwal bermain: ${formatDate(booking.booking_date)}`
                                }
                            </p>

                            {/* Booking Code */}
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-gray-800/70 border border-white px-5 py-2 shadow-sm">
                                <Hash size={14} className="text-gray-500" />
                                <span className="font-mono font-bold tracking-widest text-gray-800 dark:text-white">{booking.booking_code}</span>
                            </div>
                        </div>

                        {/* ─ Detail Cards ─ */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Jadwal */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                    <Calendar size={16} className="text-emerald-500" /> Detail Jadwal
                                </h3>
                                <InfoRow icon={Trophy}   label="Lapangan"  value={`${getSportIcon(booking.court_type)} ${booking.court_name}`} />
                                <InfoRow icon={MapPin}   label="Venue"     value={booking.venue_name} />
                                <InfoRow icon={Calendar} label="Tanggal"   value={formatDate(booking.booking_date)} />
                                <InfoRow icon={Clock}    label="Jam"       value={`${booking.start_time} – ${booking.end_time} (${booking.duration_hours} jam)`} />
                            </div>

                            {/* Customer */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                    <User size={16} className="text-blue-500" /> Detail Customer
                                </h3>
                                <InfoRow icon={User}   label="Nama"  value={booking.customer_name} />
                                <InfoRow icon={Mail}   label="Email" value={booking.customer_email} />

                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Dibayar</p>
                                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatRp(booking.total_price)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            id="btn-verify-reset"
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold text-sm hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            <RefreshCw size={16} /> Verifikasi Kode Lain
                        </button>
                    </div>
                )}

                {/* ── INVALID Result ── */}
                {state === 'invalid' && (
                    <div className="space-y-4">
                        {/* Big Error Banner */}
                        <div className="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-8 text-center">
                            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-400/20" />

                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/40">
                                <Ban size={40} className="text-white" />
                            </div>

                            <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 tracking-wide">
                                ❌ TIDAK VALID
                            </h2>

                            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 max-w-sm mx-auto">
                                {result?.message ?? 'Kode Tidak Valid atau Belum Dibayar.'}
                            </p>

                            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-red-500 dark:text-red-400">
                                <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                    <AlertTriangle size={11} /> Periksa kembali kode yang dimasukkan
                                </span>
                                <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                    <XCircle size={11} /> Pastikan pembayaran sudah diselesaikan customer
                                </span>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-emerald-500/50 transition-all"
                        >
                            <RefreshCw size={16} /> Coba Lagi
                        </button>
                    </div>
                )}

                {/* ── Idle State Tips ── */}
                {state === 'idle' && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { icon: Hash,        color: 'emerald', title: 'Format Kode',  desc: 'Kode booking customer selalu diawali SPB- diikuti tanggal dan nomor urut.' },
                            { icon: CheckCircle, color: 'blue',    title: 'Status Valid',  desc: 'Kode valid jika pembayaran sudah sukses (status: Terkonfirmasi).' },
                            { icon: Calendar,    color: 'violet',  title: 'Jadwal Hari Ini', desc: 'Sistem otomatis mendeteksi apakah customer bermain hari ini atau jadwal berbeda.' },
                        ].map(({ icon: Icon, color, title, desc }) => (
                            <div key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
                                    <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </>
    );
}
