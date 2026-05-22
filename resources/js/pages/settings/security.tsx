import { Form, Head } from '@inertiajs/react';
import { ShieldCheck, Lock, KeyRound, Save, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Pengaturan Keamanan" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-8">

                {/* ─── Card: Update Password ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-emerald-50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                                <Lock size={18} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">Perbarui Password</h2>
                                <p className="text-sm text-slate-500">Pastikan akun Anda menggunakan password yang kuat dan aman</p>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                        <Form
                            {...SecurityController.update.form()}
                            options={{ preserveScroll: true }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    {/* Current Password Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="current_password"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Password Saat Ini
                                        </label>
                                        <div className="relative">
                                            <KeyRound
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                                            />
                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-slate-400"
                                                autoComplete="current-password"
                                                placeholder="Masukkan password saat ini"
                                            />
                                        </div>
                                        <InputError message={errors.current_password} />
                                    </div>

                                    {/* New Password Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                                            />
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-slate-400"
                                                autoComplete="new-password"
                                                placeholder="Buat password baru"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <ShieldCheck
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                                            />
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-slate-400"
                                                autoComplete="new-password"
                                                placeholder="Ulangi password baru"
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm hover:shadow-teal-200 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Save size={16} />
                                            {processing ? 'Menyimpan...' : 'Simpan Password'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* ─── Card: Two-Factor Authentication ─── */}
                {canManageTwoFactor && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <ShieldCheck size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-800">Autentikasi Dua Faktor</h2>
                                    <p className="text-sm text-slate-500">Tambah lapisan keamanan ekstra pada akun Anda</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            {twoFactorEnabled ? (
                                <div className="flex flex-col items-start space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl w-full">
                                        <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-emerald-800">2FA Aktif</p>
                                            <p className="text-sm text-emerald-700 mt-0.5">
                                                Anda akan diminta memasukkan kode PIN aman saat login, yang bisa diambil dari aplikasi TOTP di ponsel Anda.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative inline">
                                        <Form {...disable.form()}>
                                            {({ processing }) => (
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? 'Menonaktifkan...' : 'Nonaktifkan 2FA'}
                                                </button>
                                            )}
                                        </Form>
                                    </div>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-start space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Saat Anda mengaktifkan autentikasi dua faktor, Anda akan diminta memasukkan PIN aman saat login. PIN ini bisa diambil dari aplikasi TOTP di ponsel Anda.
                                    </p>

                                    <div>
                                        {hasSetupData ? (
                                            <button
                                                onClick={() => setShowSetupModal(true)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200"
                                            >
                                                <ShieldCheck size={16} />
                                                Lanjutkan Setup
                                            </button>
                                        ) : (
                                            <Form
                                                {...enable.form()}
                                                onSuccess={() => setShowSetupModal(true)}
                                            >
                                                {({ processing }) => (
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        <ShieldCheck size={16} />
                                                        {processing ? 'Mengaktifkan...' : 'Aktifkan 2FA'}
                                                    </button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </div>
                            )}

                            <TwoFactorSetupModal
                                isOpen={showSetupModal}
                                onClose={() => setShowSetupModal(false)}
                                requiresConfirmation={requiresConfirmation}
                                twoFactorEnabled={twoFactorEnabled}
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                clearSetupData={clearSetupData}
                                fetchSetupData={fetchSetupData}
                                errors={errors}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
