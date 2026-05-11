import { Head, Link } from '@inertiajs/react';
import { Building2, MapPin, Edit, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface Venue {
    id: number;
    name: string;
    address: string;
    image: string | null;
    courts_count: number;
}

interface Props {
    venues: Venue[];
    flash?: { success?: string; error?: string };
}

export default function OwnerVenuesIndex({ venues, flash }: Props) {
    return (
        <>
            <Head title="Tempat Olahraga Saya" />

            <div className="p-6 space-y-6">
                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                        <CheckCircle2 size={16} />
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tempat Olahraga Saya</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Daftar tempat olahraga yang ditugaskan kepada Anda.
                    </p>
                </div>

                {/* Venues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {venues.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
                            Belum ada venue yang ditugaskan ke Anda.
                        </div>
                    ) : (
                        venues.map((venue) => (
                            <div key={venue.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                                {/* Image Section */}
                                <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-700">
                                    {venue.image ? (
                                        <img
                                            src={`/uploads/venues/${venue.image}`}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <ImageIcon size={48} className="mb-2 opacity-50" />
                                            <span className="text-sm font-medium">Belum ada foto</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                            <Building2 size={14} className="text-emerald-600" />
                                            {venue.courts_count} Lapangan
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{venue.name}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 flex-1">
                                        <MapPin size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                                        <span className="line-clamp-2" title={venue.address}>{venue.address}</span>
                                    </p>
                                    
                                    <div className="pt-5 mt-auto border-t border-gray-100 dark:border-gray-700">
                                        <Link
                                            href={`/owner/venues/${venue.id}/edit`}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition"
                                        >
                                            <Edit size={16} /> Edit Info Tempat
                                        </Link>
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