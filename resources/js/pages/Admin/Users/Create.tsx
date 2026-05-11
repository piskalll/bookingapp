import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Lock } from 'lucide-react';

export default function UsersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users');
    };

    return (
        <>
            <Head title="Tambah Pengguna" />

            <div className="p-6 max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/users"
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Pengguna Baru</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Lengkapi form di bawah ini untuk menambahkan akun pengguna.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1.5">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Alamat Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                    placeholder="email@example.com"
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-500 mt-1.5">{errors.email}</p>}
                            </div>

                            {/* Role */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih Peran Pengguna (Role) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={`w-full rounded-xl border ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="owner">Owner (Mitra)</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                {errors.role && <p className="text-sm text-red-500 mt-1.5">{errors.role}</p>}
                                {data.role === 'owner' && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                        * Owner akan diberikan komisi default 10%. Pengaturan komisi lebih lanjut dapat dilakukan di menu Kelola Mitra.
                                    </p>
                                )}
                            </div>

                            {/* Password Section */}
                            <div className="sm:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Lock size={16} className="text-gray-400" />
                                    Atur Password
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white`}
                                            placeholder="Minimal 8 karakter"
                                            required
                                        />
                                        {errors.password && <p className="text-sm text-red-500 mt-1.5">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:text-white"
                                            placeholder="Ketik ulang password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-md hover:bg-violet-700 focus:ring-4 focus:ring-violet-500/30 transition-all disabled:opacity-70"
                            >
                                <Save size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
