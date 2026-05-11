import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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
}

interface Props {
    court: Court;
    venues: Venue[];
}

export default function OwnerCourtsEdit({ court, venues }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        venue_id: court.venue_id,
        name: court.name,
        type: court.type,
        price_per_hour: court.price_per_hour,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/owner/courts/${court.id}`);
    };

    return (
        <>
            <Head title={`Edit ${court.name}`} />

            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/owner/courts"
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Lapangan</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui detail untuk {court.name}.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Venue Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Tempat (Venue) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.venue_id}
                                onChange={(e) => setData('venue_id', parseInt(e.target.value))}
                                className={`w-full rounded-xl border ${errors.venue_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white`}
                            >
                                <option value="" disabled>-- Pilih Venue --</option>
                                {venues.map(venue => (
                                    <option key={venue.id} value={venue.id}>
                                        {venue.name}
                                    </option>
                                ))}
                            </select>
                            {errors.venue_id && <p className="text-sm text-red-500 mt-1.5">{errors.venue_id}</p>}
                        </div>

                        {/* Court Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Nama Lapangan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white`}
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1.5">{errors.name}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Court Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Tipe Olahraga <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white`}
                                />
                                {errors.type && <p className="text-sm text-red-500 mt-1.5">{errors.type}</p>}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Harga per Jam (Rp) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.price_per_hour}
                                    onChange={(e) => setData('price_per_hour', parseInt(e.target.value))}
                                    className={`w-full rounded-xl border ${errors.price_per_hour ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white`}
                                />
                                {errors.price_per_hour && <p className="text-sm text-red-500 mt-1.5">{errors.price_per_hour}</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-70"
                            >
                                <Save size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
