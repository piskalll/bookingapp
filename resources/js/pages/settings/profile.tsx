import { Form, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, CheckCircle, AlertCircle, Save } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { send } from '@/routes/verification';
import { edit } from '@/routes/profile';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Pengaturan Profil" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-8">

                {/* ─── Card: Update Profile Information ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <User size={18} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">Informasi Profil</h2>
                                <p className="text-sm text-slate-500">Perbarui nama dan alamat email Anda</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                        <Form
                            {...ProfileController.update.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Name Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Nama Lengkap
                                        </label>
                                        <div className="relative">
                                            <User
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                defaultValue={auth.user.name}
                                                required
                                                autoComplete="name"
                                                placeholder="Nama lengkap Anda"
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400"
                                            />
                                        </div>
                                        <InputError className="mt-1" message={errors.name} />
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Alamat Email
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                defaultValue={auth.user.email}
                                                required
                                                autoComplete="username"
                                                placeholder="Alamat email Anda"
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-400"
                                            />
                                        </div>
                                        <InputError className="mt-1" message={errors.email} />
                                    </div>

                                    {/* Email Verification Banner */}
                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Email belum terverifikasi
                                                </p>
                                                <p className="text-sm text-amber-700 mt-0.5">
                                                    Alamat email Anda belum diverifikasi.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-semibold underline underline-offset-2 hover:text-amber-900 transition"
                                                    >
                                                        Kirim ulang email verifikasi.
                                                    </Link>
                                                </p>

                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                                        <CheckCircle size={14} />
                                                        Link verifikasi baru telah dikirim ke email Anda.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-profile-button"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:shadow-emerald-200 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Save size={16} />
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>

                                        {status === 'profile-information-updated' && (
                                            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in">
                                                <CheckCircle size={14} />
                                                Tersimpan!
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* ─── Card: Delete Account ─── */}
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
