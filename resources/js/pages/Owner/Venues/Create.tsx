import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Kelola Tempat', href: '/owner/venues' },
    { label: 'Tambah Tempat Baru', href: '#' },
];

export default function CreateVenue() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address: '',
        image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Mengirim data ke rute store
        post('/owner/venues', {
            forceFormData: true, // Wajib di-true-kan jika ada file upload
        });
    };

    return (
        <>
            <Head title="Tambah Tempat" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Informasi Tempat Olahraga
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Silakan isi detail lokasi tempat olahraga yang Anda miliki.</p>
                        </div>
                        
                        <form onSubmit={submit} className="mt-6 space-y-6">
                            {/* Input Nama Tempat */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nama Tempat
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Contoh: Gor Bintang Futsal"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Input Alamat */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                                />
                                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
                            </div>

                            {/* Input Foto */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                    Foto Tampak Depan
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <Link
                                    href="/owner/venues"
                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Tempat'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}

// Menerapkan persistent layout agar sidebar tidak ganda
CreateVenue.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);