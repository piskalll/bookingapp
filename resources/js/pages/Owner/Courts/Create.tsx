import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEventHandler } from 'react';

interface Venue {
    id: number;
    name: string;
}

export default function CreateCourt({ venue }: { venue: Venue }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Kelola Tempat', href: '/owner/venues' },
        { label: `Lapangan ${venue.name}`, href: `/owner/venues/${venue.id}/courts` },
        { label: 'Tambah Lapangan', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'futsal',
        price_per_hour: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/owner/venues/${venue.id}/courts`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Lapangan di ${venue.name}`} />
            
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Tambah Lapangan Baru</h3>
                    <p className="text-sm text-gray-500 mb-6">Untuk tempat: {venue.name}</p>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lapangan</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Lapangan Futsal Sintetis 1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Olahraga</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="futsal">Futsal</option>
                                <option value="badminton">Badminton</option>
                                <option value="basket">Basket</option>
                            </select>
                            {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Harga per Jam (Rp)</label>
                            <input
                                type="number"
                                min="0"
                                value={data.price_per_hour}
                                onChange={(e) => setData('price_per_hour', e.target.value)}
                                placeholder="Contoh: 150000"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.price_per_hour && <p className="text-red-600 text-xs mt-1">{errors.price_per_hour}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link
                                href={`/owner/venues/${venue.id}/courts`}
                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Lapangan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}