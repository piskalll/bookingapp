import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { dashboard } from '@/routes';

interface Venue {
    id: number;
    name: string;
    address: string;
    image: string | null;
}

interface Props {
    venues: Venue[];
}

export default function VenuesIndex({ venues }: Props) {
    const { flash } = usePage().props;
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tempat olahraga ini?')) {
            router.delete(`/admin/venues/${id}`);
        }
    };

    const getImageUrl = (imageName: string | null) => {
        return imageName ? `/venues/${imageName}` : null;
    };

    return (
        <>
            <Head title="Kelola Tempat" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Tempat Olahraga</h1>
                        <p className="text-gray-600 mt-2">Mengelola daftar tempat olahraga dan fasilitas</p>
                    </div>
                    <Link
                        href="/admin/venues/create"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Tambah Tempat
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
                {venues.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Gambar
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Nama Tempat
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Alamat
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {venues.map((venue) => (
                                    <tr key={venue.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {getImageUrl(venue.image) ? (
                                                <img
                                                    src={getImageUrl(venue.image)!}
                                                    alt={venue.name}
                                                    className="h-16 w-20 object-cover rounded-md cursor-pointer hover:opacity-75"
                                                    onClick={() => setImagePreview(getImageUrl(venue.image)!)}
                                                />
                                            ) : (
                                                <div className="h-16 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                                                    <MapPin size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {venue.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {venue.address}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/venues/${venue.id}/edit`}
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm font-medium"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(venue.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 mb-4">Belum ada tempat olahraga</p>
                        <Link
                            href="/admin/venues/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={18} />
                            Tambah Tempat Pertama
                        </Link>
                    </div>
                )}

                {/* Image Preview Modal */}
                {imagePreview && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Preview Gambar</h3>
                                <button
                                    onClick={() => setImagePreview(null)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-6">
                                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

VenuesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tempat Olahraga',
            href: '/admin/venues',
        },
    ],
};
