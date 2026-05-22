import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        /* ─── Card: Delete Account ─── */
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center">
                        <Trash2 size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Hapus Akun</h2>
                        <p className="text-sm text-slate-500">Hapus akun Anda beserta seluruh data secara permanen</p>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-4">
                {/* Warning Banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-red-700">Peringatan: Tindakan Tidak Dapat Dibatalkan</p>
                        <p className="text-sm text-red-600">
                            Setelah akun dihapus, semua data Anda termasuk riwayat pemesanan akan hilang secara permanen. Harap lanjutkan dengan hati-hati.
                        </p>
                    </div>
                </div>

                {/* Delete Trigger */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            data-test="delete-user-button"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200"
                        >
                            <Trash2 size={16} />
                            Hapus Akun Saya
                        </button>
                    </DialogTrigger>

                    <DialogContent className="rounded-2xl">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-semibold text-slate-900">
                                Hapus akun Anda?
                            </DialogTitle>
                        </div>

                        <DialogDescription className="text-sm text-slate-600 leading-relaxed">
                            Setelah akun Anda dihapus, semua data dan resource akan dihapus secara permanen.
                            Masukkan password Anda untuk mengkonfirmasi bahwa Anda ingin menghapus akun secara permanen.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-5 mt-2"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="delete-password"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="delete-password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan password Anda"
                                            autoComplete="current-password"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 hover:border-slate-400"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                                        <DialogClose asChild>
                                            <button
                                                type="button"
                                                onClick={() => resetAndClearErrors()}
                                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all duration-200"
                                            >
                                                Batal
                                            </button>
                                        </DialogClose>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="confirm-delete-user-button"
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                                        </button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
