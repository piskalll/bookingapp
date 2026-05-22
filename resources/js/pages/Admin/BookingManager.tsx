import { useState } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle, Eye, AlertCircle, FileText, Calendar, CheckCircle2 } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview Bukti Pembayaran</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-6 flex justify-center bg-gray-100 dark:bg-gray-900">
                    <img
                        src={`/storage/${imagePath}`}
                        alt="Payment Proof"
                        className="max-h-[70vh] rounded-xl object-contain shadow-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold shadow-lg transition-all ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
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
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-800 dark:text-amber-300',
                icon: Clock,
                label: 'Menunggu Bayar',
            },
            waiting_confirmation: {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-800 dark:text-blue-300',
                icon: AlertCircle,
                label: 'Perlu Konfirmasi',
            },
            confirmed: {
                bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                text: 'text-emerald-800 dark:text-emerald-300',
                icon: CheckCircle,
                label: 'Terkonfirmasi',
            },
            cancelled: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-800 dark:text-red-300',
                icon: XCircle,
                label: 'Dibatalkan',
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.text}`}>
                <Icon size={14} strokeWidth={2.5} />
                <span className="text-xs font-bold whitespace-nowrap">{config.label}</span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
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

        if (startDate > endDate) {
            alert('Tanggal mulai harus lebih awal dari tanggal akhir');
            return;
        }

        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });

        window.open(`/admin/reports/export-pdf?${params.toString()}`, '_blank');
    };

    return (
        <>
            <Head title="Semua Pesanan" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Pesanan</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Kelola dan konfirmasi pesanan pelanggan secara keseluruhan.
                    </p>
                </div>

                {/* Success Message */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                        <CheckCircle2 size={18} className="shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Filter & Export Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        {/* Start Date */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                Dari Tanggal
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white transition"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                                Sampai Tanggal
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white transition"
                                />
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportPdf}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold text-sm transition shadow-lg shadow-gray-900/20 dark:shadow-white/10 w-full md:w-auto"
                        >
                            <FileText size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pemesan</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tempat / Lapangan</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jadwal</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">-</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white">{booking.user_name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.user_email}</div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-sm text-gray-900 dark:text-white">{booking.venue_name}</div>
                                                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-0.5">{booking.court_name}</div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {formatDate(booking.booking_date)}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Clock size={12} />
                                                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {formatCurrency(booking.total_price)}
                                                </div>
                                                {booking.payment_proof && (
                                                    <button
                                                        onClick={() => handleViewProof(booking.payment_proof)}
                                                        className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <Eye size={12} /> Cek Bukti
                                                    </button>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                {getStatusBadge(booking.status)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                {needsApproval(booking) ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRejectClick(booking.id)}
                                                            disabled={rejectProcessing}
                                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors disabled:opacity-50"
                                                            title="Tolak Pesanan"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveClick(booking.id)}
                                                            disabled={approveProcessing}
                                                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-xl transition-colors disabled:opacity-50"
                                                            title="Setujui Pesanan"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600 text-sm italic">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FileText size={24} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada Pesanan</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                Tidak ada data pesanan yang ditemukan untuk rentang tanggal ini.
                            </p>
                        </div>
                    )}
                </div>
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
                        ? 'Konfirmasi Pembayaran'
                        : 'Tolak Pesanan'
                }
                message={
                    confirmDialog.action === 'approve'
                        ? 'Tandai pesanan ini sebagai Lunas (Terkonfirmasi)? Pastikan Anda sudah mengecek bukti transfer.'
                        : 'Apakah Anda yakin ingin menolak pesanan ini? Pesanan akan dibatalkan permanen.'
                }
                confirmText={confirmDialog.action === 'approve' ? 'Ya, Konfirmasi' : 'Ya, Tolak'}
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
