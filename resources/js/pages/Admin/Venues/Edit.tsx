import { FormEvent, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { dashboard } from '@/routes';

interface Venue {
    id: number;
    name: string;
    address: string;
    image: string | null;
}

interface Props {
    venue: Venue;
}

export default function VenuesEdit({ venue }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: venue.name,
        address: venue.address,
        image: null as File | null,
        _method: 'PUT',
    });

    const [preview, setPreview] = useState<string | null>(
        venue.image ? `/venue-images/${venue.image}` : null
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/venues/${venue.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Edit Tempat Olahraga" />

            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/venues"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ChevronLeft size={20} />
                        Kembali
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Tempat Olahraga</h1>
                    <p className="text-gray-600 mt-2">Perbarui informasi tempat olahraga</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Nama Tempat */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Tempat <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Contoh: GOR Samping Jln Merdeka"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Alamat */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alamat <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Contoh: Jl. Merdeka No. 123, Kota, Provinsi"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Upload Gambar */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gambar Tempat
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-input"
                            />
                            <label htmlFor="image-input" className="cursor-pointer">
                                <div className="text-center">
                                    {preview ? (
                                        <>
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-48 w-full object-cover rounded-lg mb-4"
                                            />
                                            <p className="text-sm text-gray-600">
                                                Klik untuk mengubah gambar
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-6-12l-3.172-3.172a4 4 0 00-5.656 0L12 16m16-8v8m0 0v8"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Drag gambar atau klik untuk upload
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                JPG, PNG (Maks 2MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <Link
                            href="/admin/venues"
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

VenuesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tempat Olahraga',
            href: '/admin/venues',
        },
        {
            title: 'Edit',
        },
    ],
};
