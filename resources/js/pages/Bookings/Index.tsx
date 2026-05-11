import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle, Upload, X, MapPin, Calendar, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { storePayment } from '@/routes/bookings';

interface Booking {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
    payment_proof?: string | null;
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
}

interface Props {
    bookings: Booking[];
}

/* ------------------------------------------------------------------ */
/*  Sport icon helper                                                  */
/* ------------------------------------------------------------------ */
const sportIcons: Record<string, string> = {
    futsal: '⚽', badminton: '🏸', basket: '🏀', basketball: '🏀',
    tennis: '🎾', voli: '🏐', volleyball: '🏐',
};
function getSportIcon(type: string) {
    return sportIcons[type.toLowerCase()] || '🏟️';
}

// Component: Payment Proof Modal
interface PaymentProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    onSuccess: () => void;
}

function PaymentProofModal({ isOpen, onClose, bookingId, onSuccess }: PaymentProofModalProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        payment_proof: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validasi tipe file
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('File harus berupa JPG atau PNG');
                return;
            }

            // Validasi ukuran (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB');
                return;
            }

            // Set file ke form
            setData('payment_proof', file);

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.payment_proof) {
            alert('Silakan pilih file bukti pembayaran');
            return;
        }

        post(storePayment(bookingId), {
            onSuccess: () => {
                reset();
                setPreviewImage(null);
                onClose();
                onSuccess();
            },
            onError: (errors) => {
                console.error('Upload error:', errors);
                alert(errors.payment_proof || 'Gagal mengunggah bukti pembayaran');
            },
            forceFormData: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Unggah Bukti Pembayaran</h2>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Pilih File Gambar
                        </label>

                        <div className="flex items-center justify-center w-full">
                            <label className={`w-full cursor-pointer transition-all ${processing ? 'opacity-50' : 'hover:border-emerald-400 hover:bg-emerald-50'}`}>
                                <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl bg-slate-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Klik untuk memilih file
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            JPG atau PNG (Maks. 2MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png"
                                        onChange={handleFileChange}
                                        disabled={processing}
                                    />
                                </div>
                            </label>
                        </div>

                        {errors.payment_proof && (
                            <p className="text-sm text-red-600 mt-2 font-medium">{errors.payment_proof}</p>
                        )}
                    </div>

                    {/* Preview Image */}
                    {previewImage && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-sm font-bold text-slate-700 mb-2">Pratinjau</p>
                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                        <div className="mt-0.5 text-amber-500"><Clock size={18} /></div>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            Pastikan nominal yang tertera pada bukti transfer jelas dan sesuai dengan total tagihan.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-3 font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.payment_proof}
                            className="flex-1 px-4 py-3 font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Mengunggah...
                                </>
                            ) : 'Kirim Bukti'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BookingsIndex({ bookings }: Props) {
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { flash } = usePage().props;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                icon: Clock,
                label: 'Menunggu Pembayaran',
            },
            waiting_confirmation: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                icon: RefreshCw,
                label: 'Menunggu Konfirmasi',
                spin: true
            },
            confirmed: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-700',
                icon: CheckCircle,
                label: 'Terkonfirmasi',
            },
            completed: {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                icon: CheckCircle,
                label: 'Selesai',
            },
            cancelled: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                label: 'Dibatalkan',
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                label: 'Ditolak',
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text}`}>
                <Icon size={14} className={config.spin ? 'animate-spin' : ''} />
                <span className="text-xs font-bold uppercase tracking-wide">{config.label}</span>
            </div>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleOpenPaymentModal = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsModalOpen(false);
        setSelectedBookingId(null);
    };

    const handlePaymentSuccess = () => {
        window.location.reload();
    };

    const needsPayment = (booking: Booking) => {
        return booking.status === 'pending' && !booking.payment_proof;
    };

    return (
        <>
            <Head title="Riwayat Pesanan" />

            <div className="min-h-screen bg-slate-50 pb-20">
                {/* Header Banner */}
                <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-16 sm:py-20 overflow-hidden">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
                    
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Riwayat Pesanan Saya
                        </h1>
                        <p className="mt-3 text-lg text-emerald-50 max-w-2xl">
                            Kelola semua transaksi pemesanan lapangan olahraga Anda di satu tempat.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    
                    {/* Success Flash */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
                            <p className="text-sm font-semibold text-emerald-800">{flash.success}</p>
                        </div>
                    )}

                    {/* List */}
                    {bookings.length > 0 ? (
                        <div className="space-y-6">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left Side: Detail */}
                                        <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl group-hover:scale-110 transition-transform">
                                                        {getSportIcon(booking.court.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                                                            {booking.court.name}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                            <MapPin size={14} className="text-emerald-500" />
                                                            {booking.court.venue.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="md:hidden">
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 rounded-xl p-4">
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                        <Calendar size={14} /> Tanggal
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {formatDate(booking.booking_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                        <Clock size={14} /> Waktu
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {booking.start_time} - {booking.end_time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Payment & Action */}
                                        <div className="p-6 md:w-80 flex flex-col justify-center bg-slate-50/50">
                                            <div className="hidden md:flex justify-end mb-6">
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <div className="mb-6 md:text-right">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                    Total Pembayaran
                                                </p>
                                                <p className="text-2xl font-extrabold text-slate-900">
                                                    Rp {booking.total_price.toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            <div className="mt-auto space-y-3">
                                                {needsPayment(booking) && (
                                                    <button
                                                        onClick={() => handleOpenPaymentModal(booking.id)}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-bold flex items-center justify-center gap-2"
                                                    >
                                                        <CreditCard size={18} />
                                                        Bayar Sekarang
                                                    </button>
                                                )}

                                                {booking.payment_proof && (
                                                    <a
                                                        href={`/storage/${booking.payment_proof}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-3 px-4 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-bold flex items-center justify-center gap-2"
                                                    >
                                                        <ExternalLink size={18} className="text-slate-400" />
                                                        Lihat Bukti Transfer
                                                    </a>
                                                )}
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

            <PaymentProofModal
                isOpen={isModalOpen}
                onClose={handleClosePaymentModal}
                bookingId={selectedBookingId || 0}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}
