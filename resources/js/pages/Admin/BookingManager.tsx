import { useState } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle, Eye, AlertCircle, FileText } from 'lucide-react';
import { approve, reject } from '@/routes/admin/bookings';
import { dashboard } from '@/routes';

interface Booking {
    id: number;
    user_name: string;
    user_email: string;
    court_name: string;
    court_type: string;
    venue_name: string;
    venue_address: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
    payment_proof?: string | null;
    created_at: string;
}

interface Props {
    bookings: Booking[];
}

// Image Preview Modal Component
interface ImagePreviewModalProps {
    isOpen: boolean;
    imagePath?: string | null;
    onClose: () => void;
}

function ImagePreviewModal({ isOpen, imagePath, onClose }: ImagePreviewModalProps) {
    if (!isOpen || !imagePath) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Preview Bukti Pembayaran</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6">
                    <img
                        src={`/storage/${imagePath}`}
                        alt="Payment Proof"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>
        </div>
    );
}

// Confirmation Dialog Component
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    isDangerous = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${
                                isDangerous
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingManager({ bookings }: Props) {
    const { flash } = usePage().props;
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        bookingId: number | null;
        action: 'approve' | 'reject' | null;
    }>({
        isOpen: false,
        bookingId: null,
        action: null,
    });

    // Date filter states
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);

    const { put: putApprove, processing: approveProcessing } = useForm();
    const { put: putReject, processing: rejectProcessing } = useForm();

    const handleViewProof = (imagePath: string | null | undefined) => {
        if (imagePath) {
            setSelectedImage(imagePath);
            setPreviewModalOpen(true);
        }
    };

    const handleApproveClick = (bookingId: number) => {
        setConfirmDialog({
            isOpen: true,
            bookingId,
            action: 'approve',
        });
    };

    const handleRejectClick = (bookingId: number) => {
        setConfirmDialog({
            isOpen: true,
            bookingId,
            action: 'reject',
        });
    };

    const handleConfirmAction = () => {
        const { bookingId, action } = confirmDialog;
        if (!bookingId || !action) return;

        if (action === 'approve') {
            putApprove(approve(bookingId), {
                onFinish: () => {
                    setConfirmDialog({ isOpen: false, bookingId: null, action: null });
                },
            });
        } else if (action === 'reject') {
            putReject(reject(bookingId), {
                onFinish: () => {
                    setConfirmDialog({ isOpen: false, bookingId: null, action: null });
                },
            });
        }
    };

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
                icon: AlertCircle,
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
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} w-fit`}>
                <Icon size={16} />
                <span className="text-sm font-medium">{config.label}</span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const needsApproval = (booking: Booking) => {
        return booking.status === 'waiting_confirmation' || (booking.status === 'pending' && booking.payment_proof);
    };

    const handleExportPdf = () => {
        if (!startDate || !endDate) {
            alert('Silakan pilih tanggal mulai dan akhir terlebih dahulu');
            return;
        }

        // Validate date range
        if (startDate > endDate) {
            alert('Tanggal mulai harus lebih awal dari tanggal akhir');
            return;
        }

        // Open PDF export URL in new tab
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });

        window.open(`/admin/reports/export-pdf?${params.toString()}`, '_blank');
    };

    return (
        <>
            <Head title="Kelola Pesanan" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
                    <p className="text-gray-600 mt-2">
                        Kelola dan konfirmasi pesanan pelanggan yang masuk
                    </p>
                </div>

                {/* Success Message */}
                {flash?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex gap-3">
                        <CheckCircle size={20} className="flex-shrink-0" />
                        <p>{flash.success}</p>
                    </div>
                )}

                {/* Filter & Export Section */}
                <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
                        {/* Start Date */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* End Date */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
                        >
                            <FileText size={18} />
                            Cetak Laporan PDF
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Filter untuk menampilkan laporan pendapatan pesanan yang telah dikonfirmasi dalam rentang tanggal tersebut.
                    </p>
                </div>

                {/* Table Section */}
                {bookings.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Pemesan
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Lapangan
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Waktu
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Harga
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Bukti Bayar
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, index) => (
                                    <tr
                                        key={booking.id}
                                        className={`${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        } border-b border-gray-200 hover:bg-blue-50 transition`}
                                    >
                                        {/* Nama Pemesan */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{booking.user_name}</p>
                                                <p className="text-sm text-gray-600">{booking.user_email}</p>
                                            </div>
                                        </td>

                                        {/* Lapangan */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{booking.court_name}</p>
                                                <p className="text-sm text-gray-600">{booking.venue_name}</p>
                                            </div>
                                        </td>

                                        {/* Waktu */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-gray-900">{formatDate(booking.booking_date)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {booking.start_time} - {booking.end_time}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Harga */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(booking.total_price)}
                                            </p>
                                        </td>

                                        {/* Bukti Bayar */}
                                        <td className="px-6 py-4">
                                            {booking.payment_proof ? (
                                                <button
                                                    onClick={() => handleViewProof(booking.payment_proof)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                                                >
                                                    <Eye size={16} />
                                                    Lihat Bukti
                                                </button>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Belum ada bukti</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>

                                        {/* Aksi */}
                                        <td className="px-6 py-4">
                                            {needsApproval(booking) ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveClick(booking.id)}
                                                        disabled={approveProcessing}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50"
                                                    >
                                                        ✓ Setuju
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(booking.id)}
                                                        disabled={rejectProcessing}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
                                                    >
                                                        ✕ Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-600 text-lg">Tidak ada pesanan.</p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={previewModalOpen}
                imagePath={selectedImage}
                onClose={() => setPreviewModalOpen(false)}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={
                    confirmDialog.action === 'approve'
                        ? 'Konfirmasi Pesanan'
                        : 'Tolak Pesanan'
                }
                message={
                    confirmDialog.action === 'approve'
                        ? 'Apakah Anda yakin ingin menyetujui pesanan ini?'
                        : 'Apakah Anda yakin ingin menolak pesanan ini?'
                }
                confirmText={confirmDialog.action === 'approve' ? 'Setuju' : 'Tolak'}
                cancelText="Batal"
                isDangerous={confirmDialog.action === 'reject'}
                onConfirm={handleConfirmAction}
                onCancel={() =>
                    setConfirmDialog({ isOpen: false, bookingId: null, action: null })
                }
            />
        </>
    );
}

BookingManager.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kelola Pesanan',
            href: '/admin/bookings',
        },
    ],
};
