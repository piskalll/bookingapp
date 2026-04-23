import { FormEvent } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { dashboard } from '@/routes';

interface Venue {
    id: number;
    name: string;
}

interface Court {
    id: number;
    venue_id: number;
    name: string;
    type: 'futsal' | 'badminton' | 'basket';
    price_per_hour: number;
}

interface Props {
    court: Court;
    venues: Venue[];
}

const sportTypes = [
    { value: 'futsal', label: 'Futsal' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'basket', label: 'Basket' },
];

export default function CourtsEdit({ court, venues }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        venue_id: court.venue_id.toString(),
        name: court.name,
        type: court.type,
        price_per_hour: court.price_per_hour.toString(),
        _method: 'PUT',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/courts/${court.id}`);
    };

    return (
        <>
            <Head title="Edit Lapangan" />

            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/courts"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ChevronLeft size={20} />
                        Kembali
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Lapangan</h1>
                    <p className="text-gray-600 mt-2">Perbarui informasi lapangan olahraga</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Pilih Tempat */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Tempat (Venue) <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.venue_id}
                            onChange={(e) => setData('venue_id', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.venue_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">-- Pilih Tempat --</option>
                            {venues.map((venue) => (
                                <option key={venue.id} value={venue.id}>
                                    {venue.name}
                                </option>
                            ))}
                        </select>
                        {errors.venue_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.venue_id}</p>
                        )}
                    </div>

                    {/* Nama Lapangan */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lapangan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Contoh: Lapangan Futsal A"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Tipe Olahraga */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cabang Olahraga <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.type ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">-- Pilih Cabang Olahraga --</option>
                            {sportTypes.map((sport) => (
                                <option key={sport.value} value={sport.value}>
                                    {sport.label}
                                </option>
                            ))}
                        </select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    </div>

                    {/* Harga Per Jam */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Harga Per Jam (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.price_per_hour}
                            onChange={(e) => setData('price_per_hour', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.price_per_hour ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Contoh: 100000"
                            min="1"
                        />
                        {errors.price_per_hour && (
                            <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <Link
                            href="/admin/courts"
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
                        >
                            {processing ? 'Menyimpan...' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

CourtsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Lapangan',
            href: '/admin/courts',
        },
        {
            title: 'Edit',
        },
    ],
};
