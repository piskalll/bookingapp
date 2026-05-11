import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Image as ImageIcon
} from 'lucide-react';

interface Owner {
    id: number;
    name: string;
    subscription_status: string;
}

interface Venue {
    id: number;
    user_id: number;
    name: string;
    address: string;
    image: string | null;
    owner: Owner;
}

interface Props {
    venues: {
        data: Venue[];
        links: any[];
    };
    filters: {
        search: string;
    };
    flash?: { success?: string; error?: string };
}

export default function AdminVenuesIndex({ venues, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/venues', { search }, { preserveState: true });
    };

    const handleDelete = (venue: Venue) => {
        if (confirm(`Hapus venue ${venue.name}?`)) {
            router.delete(`/admin/venues/${venue.id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Tempat (Venues)" />

            <div className="p-6 space-y-6">
                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                        <CheckCircle2 size={16} />
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Tempat (Venues)</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manajemen semua tempat olahraga yang terdaftar dalam platform.
                        </p>
                    </div>
                    <Link
                        href="/admin/venues/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium text-sm"
                    >
                        <Plus size={16} /> Tambah Venue Baru
                    </Link>
                </div>

                {/* Data Table Container */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <form onSubmit={handleSearch} className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama venue..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all dark:text-white"
                            />
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Venue</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Alamat</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Owner (Mitra)</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {venues.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data venue ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    venues.data.map((venue) => (
                                        <tr key={venue.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {venue.image ? (
                                                        <img
                                                            src={`/uploads/venues/${venue.image}`}
                                                            alt={venue.name}
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{venue.name}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Building2 size={12} /> ID: {venue.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={venue.address}>
                                                    {venue.address}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                        {venue.owner?.name || 'Tidak ada'}
                                                    </span>
                                                    {venue.owner && (
                                                        <span className={`inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            venue.owner.subscription_status === 'active'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {venue.owner.subscription_status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                            {venue.owner.subscription_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/venues/${venue.id}/edit`}
                                                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(venue)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Simplified */}
                    {venues.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-1">
                            {venues.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                        link.active
                                            ? 'bg-violet-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
