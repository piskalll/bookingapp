import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, Upload, X } from 'lucide-react';
import { index as venuesIndex } from '@/routes/venues';
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
    const { flash } = usePage().props;

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

        // Submit dengan multipart form-data
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Unggah Bukti Pembayaran</h2>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih File Bukti Pembayaran
                        </label>

                        <div className="flex items-center justify-center w-full">
                            <label className="w-full cursor-pointer">
                                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="text-gray-400 mb-2" size={24} />
                                        <p className="text-sm text-gray-600">
                                            JPG atau PNG (Max 2MB)
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
                            <p className="text-sm text-red-600 mt-2">{errors.payment_proof}</p>
                        )}
                    </div>

                    {/* Preview Image */}
                    {previewImage && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Pratinjau</p>
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            📸 Pastikan bukti pembayaran jelas terlihat dan mencakup nominal yang sesuai
                            dengan total harga pesanan.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.payment_proof}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {processing ? 'Mengunggah...' : 'Kirim'}
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
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: Clock,
                label: 'Menunggu Pembayaran',
            },
            waiting_confirmation: {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                icon: Clock,
                label: 'Menunggu Konfirmasi',
            },
            confirmed: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: CheckCircle,
                label: 'Terkonfirmasi',
            },
            cancelled: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: XCircle,
                label: 'Dibatalkan',
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text}`}>
                <Icon size={16} />
                <span className="text-sm font-medium">{config.label}</span>
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
        // Reload halaman untuk menampilkan perubahan
        window.location.reload();
    };

    const needsPayment = (booking: Booking) => {
        return booking.status === 'pending' && !booking.payment_proof;
    };

    return (
        <>
            <Head title="Daftar Pemesanan Saya" />

            <div className="flex flex-col gap-6 p-6">
                {/* Success Message */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                        ✅ {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Pemesanan Saya</h1>
                        <p className="text-gray-600">
                            Kelola dan lihat riwayat pemesanan lapangan Anda
                        </p>
                    </div>

                    <Link href={venuesIndex()}>
                        <Button>Pesan Lapangan Baru</Button>
                    </Link>
                </div>

                {/* Bookings List */}
                {bookings.length > 0 ? (
                    <div className="grid gap-4">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Left: Court Info */}
                                    <div className="md:col-span-2">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {booking.court.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 capitalize mb-1">
                                                {booking.court.type}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.court.venue.name}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600 font-medium">Tanggal</p>
                                                <p className="text-gray-900">
                                                    {formatDate(booking.booking_date)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-600 font-medium">Jam</p>
                                                <p className="text-gray-900">
                                                    {booking.start_time} - {booking.end_time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Price & Status */}
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium mb-2">
                                                Total Harga
                                            </p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                Rp {booking.total_price.toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-end">{getStatusBadge(booking.status)}</div>

                                            {/* Pay Now Button */}
                                            {needsPayment(booking) && (
                                                <button
                                                    onClick={() => handleOpenPaymentModal(booking.id)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                                                >
                                                    💳 Bayar Sekarang
                                                </button>
                                            )}

                                            {/* Payment Proof Uploaded */}
                                            {booking.payment_proof && (
                                                <a
                                                    href={`/storage/${booking.payment_proof}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm font-medium"
                                                >
                                                    📄 Lihat Bukti Pembayaran
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-gray-200 rounded-lg">
                        <p className="text-gray-500 text-lg mb-4">Anda belum memiliki pemesanan.</p>
                        <Link href={venuesIndex()}>
                            <Button>Pesan Lapangan Sekarang</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <PaymentProofModal
                isOpen={isModalOpen}
                onClose={handleClosePaymentModal}
                bookingId={selectedBookingId || 0}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}

// Layout configuration
// BookingsIndex.layout = {
//     breadcrumbs: [
//         { label: 'Dashboard', href: route('dashboard') },
//         { label: 'Pemesanan Saya', href: route('bookings.index') },
//     ],
// };
