import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEventHandler } from 'react';

interface Venue {
    id: number;
    name: string;
    address: string;
    image: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Kelola Tempat', href: '/owner/venues' },
    { label: 'Edit Tempat', href: '#' },
];

export default function EditVenue({ venue }: { venue: Venue }) {
    const { data, setData, post, processing, errors } = useForm({
        name: venue.name,
        address: venue.address,
        image: null as File | null,
        _method: 'PUT', // Digunakan untuk mensimulasikan rute PUT saat mengirim file
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Menggunakan post dengan _method: 'PUT' karena PHP/Laravel tidak bisa membaca file via rute PUT murni
        post(`/owner/venues/${venue.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Edit ${venue.name}`} />
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Ubah Informasi Tempat</h3>
                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Tempat</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat</label>
                            <textarea
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Foto Baru (Opsional)</label>
                            {venue.image && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-400 mb-1">Foto saat ini:</p>
                                    <img src={`/uploads/venues/${venue.image}`} className="h-20 w-20 object-cover rounded border" alt="Existing" />
                                </div>
                            )}
                            <input
                                type="file"
                                onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                className="mt-1 block w-full text-sm text-gray-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {processing ? 'Menyimpan...' : 'Perbarui Tempat'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

EditVenue.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);