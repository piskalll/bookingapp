import { Form, Head, Link } from '@inertiajs/react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5">
                    <CheckCircle size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                    <p className="text-sm font-medium text-emerald-700">{status}</p>
                </div>
            )}

            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                    Alamat Email Terdaftar
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="nama@email.com"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <Spinner />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Kirim Link Reset Password
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </Form>

                <p className="text-center text-sm text-slate-500">
                    Ingat password Anda?{' '}
                    <Link
                        href={login()}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition"
                    >
                        Kembali masuk
                    </Link>
                </p>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Password?',
    description: 'Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.',
};
