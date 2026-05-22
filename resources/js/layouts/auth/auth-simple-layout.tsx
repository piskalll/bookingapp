import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-svh lg:grid-cols-2">
            {/* ─── LEFT SIDE: Sports Image Panel ─── */}
            <div className="relative hidden lg:flex flex-col">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?q=80&w=1080&auto=format&fit=crop')",
                    }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-800/70 to-slate-900/80" />

                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-emerald-400/20 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-teal-400/15 blur-[80px]" />

                {/* Content overlay */}
                <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
                    {/* Logo */}
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-3 group"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold text-white shadow-lg backdrop-blur-sm transition group-hover:bg-white/30">
                            ⚽
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-white">
                            LapanganPro
                        </span>
                    </Link>

                    {/* Tagline */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 backdrop-blur-sm">
                            <span className="text-emerald-300 text-sm">✨</span>
                            <span className="text-sm font-medium text-emerald-200">Platform Olahraga #1 di Indonesia</span>
                        </div>
                        <h2 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                            Temukan{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Lapangan Terbaik
                            </span>{' '}
                            untuk Olahraga Anda
                        </h2>
                        <p className="max-w-sm text-base leading-relaxed text-slate-300">
                            Bergabunglah dengan lebih dari 50.000 pengguna aktif yang menyewa lapangan futsal, badminton, basket, dan tenis setiap hari.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                ['500+', 'Lapangan'],
                                ['50K+', 'Pengguna'],
                                ['4.8 ★', 'Rating'],
                            ].map(([val, label]) => (
                                <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-sm">
                                    <div className="text-xl font-extrabold text-emerald-300">{val}</div>
                                    <div className="text-xs text-slate-400">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                        <p className="text-sm italic text-slate-300">
                            "LapanganPro memudahkan saya menemukan dan memesan lapangan futsal dengan cepat. Aplikasi terbaik untuk olahraga!"
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">A</div>
                            <div>
                                <p className="text-sm font-semibold text-white">Ahmad Rizki</p>
                                <p className="text-xs text-slate-400">Pengguna aktif sejak 2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT SIDE: Form Panel ─── */}
            <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:px-12">
                {/* Mobile: Logo visible only on small screens */}
                <Link
                    href={home()}
                    className="mb-8 inline-flex items-center gap-2 lg:hidden"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white shadow-md">
                        ⚽
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">LapanganPro</span>
                </Link>

                <div className="w-full max-w-md">
                    {/* Form header */}
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm text-slate-500">{description}</p>
                        )}
                    </div>

                    {/* Form content */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        {children}
                    </div>

                    {/* Back to home link */}
                    <p className="mt-6 text-center text-xs text-slate-400">
                        Dengan melanjutkan, Anda menyetujui{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Syarat &amp; Ketentuan</a>{' '}
                        dan{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Kebijakan Privasi</a> kami.
                    </p>
                </div>
            </div>
        </div>
    );
}
