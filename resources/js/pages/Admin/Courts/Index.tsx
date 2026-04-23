import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2, Plus, Dumbbell } from 'lucide-react';
import { dashboard } from '@/routes';

interface Court {
    id: number;
    name: string;
    type: 'futsal' | 'badminton' | 'basket';
    price_per_hour: number;
    venue_id: number;
    venue_name: string;
}

interface Props {
    courts: Court[];
}

const sportTypeColors: Record<string, { bg: string; text: string; label: string }> = {
    futsal: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Futsal' },
    badminton: { bg: 'bg-green-100', text: 'text-green-800', label: 'Badminton' },
    basket: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Basket' },
};

export default function CourtsIndex({ courts }: Props) {
    const { flash } = usePage().props;

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus lapangan ini?')) {
            router.delete(`/admin/courts/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="Kelola Lapangan" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Lapangan</h1>
                        <p className="text-gray-600 mt-2">Mengelola daftar lapangan olahraga</p>
                    </div>
                    <Link
                        href="/admin/courts/create"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Tambah Lapangan
                    </Link>
                </div>

                {/* Success Message */}
                {flash?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex gap-3">
                        <span>✓</span>
                        <p>{flash.success}</p>
                    </div>
                )}

                {/* Table Section */}
                {courts.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Nama Lapangan
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Cabang Olahraga
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Harga/Jam
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Tempat (Venue)
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courts.map((court) => {
                                    const sportType = sportTypeColors[court.type];
                                    return (
                                        <tr key={court.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {court.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${sportType.bg} ${sportType.text}`}
                                                >
                                                    {sportType.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-green-700">
                                                {formatCurrency(court.price_per_hour)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {court.venue_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/admin/courts/${court.id}/edit`}
                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm font-medium"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(court.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm font-medium"
                                                    >
                                                        <Trash2 size={16} />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <Dumbbell size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-4">Belum ada lapangan</p>
                        <Link
                            href="/admin/courts/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={18} />
                            Tambah Lapangan Pertama
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

CourtsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Lapangan',
            href: '/admin/courts',
        },
    ],
};
