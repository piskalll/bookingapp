import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

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
}

interface Props {
    venue: Venue;
    owners: Owner[];
}

export default function AdminVenuesEdit({ venue, owners }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        user_id: venue.user_id,
        name: venue.name,
        address: venue.address,
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(venue.image ? `/uploads/venues/${venue.image}` : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/venues/${venue.id}`);
    };

    return (
        <>
            <Head title="Edit Venue" />

            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/venues"
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Venue</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ubah informasi tempat olahraga dan mitra owner.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Owner Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Mitra Pemilik (Owner) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', parseInt(e.target.value))}
                                className={`w-full rounded-xl border ${errors.user_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                            >
                                <option value="" disabled>-- Pilih Owner --</option>
                                {owners.map(owner => (
                                    <option key={owner.id} value={owner.id}>
                                        {owner.name} ({owner.subscription_status === 'active' ? 'Aktif' : 'Nonaktif'})
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <p className="text-sm text-red-500 mt-1.5">{errors.user_id}</p>}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Venue Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Tempat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1.5">{errors.name}</p>}
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                ></textarea>
                                {errors.address && <p className="text-sm text-red-500 mt-1.5">{errors.address}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Foto/Gambar Tempat
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10'} rounded-2xl p-8 text-center cursor-pointer transition-colors relative overflow-hidden`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                    />
                                    
                                    {imagePreview ? (
                                        <div className="absolute inset-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-900 drop-shadow-md font-semibold">
                                                <Upload size={32} className="mb-2" />
                                                <span>Klik untuk mengubah gambar</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                                <Upload size={24} />
                                            </div>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">Klik untuk mengunggah gambar baru</p>
                                            <p className="text-xs mt-1">Biarkan kosong jika tidak ingin mengubah</p>
                                        </div>
                                    )}
                                </div>
                                {errors.image && <p className="text-sm text-red-500 mt-1.5">{errors.image}</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md hover:bg-violet-700 focus:ring-4 focus:ring-violet-500/30 transition-all disabled:opacity-70"
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
