import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, CheckCircle2, Layout, MapPin, DollarSign, Activity } from 'lucide-react';

interface Venue {
    id: number;
    name: string;
}

interface Court {
    id: number;
    venue_id: number;
    name: string;
    type: string;
    price_per_hour: number;
    venue: Venue;
}

interface Props {
    courts: Court[];
    flash?: { success?: string; error?: string };
}

export default function OwnerCourtsIndex({ courts, flash }: Props) {
    const formatRp = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const handleDelete = (court: Court) => {
        if (confirm(`Hapus lapangan ${court.name}?`)) {
            router.delete(`/owner/courts/${court.id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Lapangan" />

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Lapangan</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Atur lapangan olahraga di seluruh venue Anda.
                        </p>
                    </div>
                    <Link
                        href="/owner/courts/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                    >
                        <Plus size={16} /> Tambah Lapangan
                    </Link>
                </div>

                {/* Courts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {courts.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
                            Belum ada lapangan yang ditambahkan.
                        </div>
                    ) : (
                        courts.map((court) => (
                            <div key={court.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                        <Layout size={20} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/owner/courts/${court.id}/edit`}
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(court)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{court.name}</h3>
                                
                                <div className="mt-4 space-y-2.5 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="truncate" title={court.venue.name}>{court.venue.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Activity size={14} className="text-gray-400" />
                                        <span>{court.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <DollarSign size={14} className="text-gray-400" />
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatRp(court.price_per_hour)} / jam</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}