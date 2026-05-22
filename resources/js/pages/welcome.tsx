import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Search, Calendar, Trophy, ArrowRight, MapPin,
    Star, Facebook, Twitter, Instagram, Linkedin, Menu, X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
}

interface FeaturedVenue {
    id: number;
    name: string;
    address: string;
    image: string | null;
    min_price: number;
    courts: Court[];
}

/* ------------------------------------------------------------------ */
/*  Fade-in on scroll hook                                             */
/* ------------------------------------------------------------------ */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold: 0.15 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return { ref, className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}` };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const sportIcons: Record<string, string> = {
    futsal: '⚽',
    badminton: '🏸',
    basket: '🏀',
    basketball: '🏀',
    tennis: '🎾',
    voli: '🏐',
    volleyball: '🏐',
};

function getSportIcon(type: string) {
    return sportIcons[type?.toLowerCase()] ?? '🏟️';
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const steps = [
    { title: 'Cari Lapangan', desc: 'Temukan lapangan olahraga pilihan Anda dengan mudah menggunakan fitur pencarian lokasi.', icon: Search, num: '01' },
    { title: 'Pilih Jadwal', desc: 'Pilih tanggal dan jam yang tersedia sesuai dengan kebutuhan Anda.', icon: Calendar, num: '02' },
    { title: 'Bayar & Main', desc: 'Selesaikan pembayaran dan langsung nikmati bermain di lapangan impian Anda.', icon: Trophy, num: '03' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Welcome({ featuredVenues = [] }: { featuredVenues?: FeaturedVenue[] }) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    /* fade refs */
    const heroFade = useFadeIn();
    const howTitle = useFadeIn();
    const venueTitle = useFadeIn();
    const ctaFade = useFadeIn();

    return (
        <>
            <Head title="Home - Sewa Lapangan Olahraga Online" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
                {/* ========== NAVBAR ========== */}
                <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-transparent'}`}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/25">⚽</div>
                                <span className={`hidden font-extrabold tracking-tight sm:inline text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>LapanganPro</span>
                            </div>

                            {/* Desktop links */}
                            <div className="hidden items-center gap-8 md:flex">
                                {[['#hero', 'Beranda'], ['#how-it-works', 'Cara Kerja'], ['#venues', 'Lapangan']].map(([href, label]) => (
                                    <a key={href} href={href} className={`text-sm font-medium transition hover:text-emerald-400 ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>{label}</a>
                                ))}
                            </div>

                            {/* Desktop CTA */}
                            <div className="hidden items-center gap-3 md:flex">
                                {user ? (
                                    <Link href="/dashboard" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${scrolled ? 'text-emerald-600 hover:text-emerald-700' : 'text-white hover:text-emerald-300'}`}>Masuk</Link>
                                        <Link href="/register" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700">Daftar</Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile burger */}
                            <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Mobile menu */}
                        {menuOpen && (
                            <div className="rounded-b-2xl bg-white pb-4 shadow-xl md:hidden">
                                {[['#hero', 'Beranda'], ['#how-it-works', 'Cara Kerja'], ['#venues', 'Lapangan']].map(([href, label]) => (
                                    <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600">{label}</a>
                                ))}
                                <div className="mt-2 flex gap-3 border-t border-gray-100 px-4 pt-4">
                                    {user ? (
                                        <Link href="/dashboard" className="flex-1 rounded-lg bg-emerald-600 py-2 text-center text-sm font-semibold text-white">Dashboard</Link>
                                    ) : (
                                        <>
                                            <Link href="/login" className="flex-1 rounded-lg border border-emerald-600 py-2 text-center text-sm font-semibold text-emerald-600">Masuk</Link>
                                            <Link href="/register" className="flex-1 rounded-lg bg-emerald-600 py-2 text-center text-sm font-semibold text-white">Daftar</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* ========== HERO ========== */}
                <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
                    {/* BG image + overlay */}
                    <img src="/images/landing/hero-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />
                    <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-teal-400/15 blur-[120px]" />

                    <div ref={heroFade.ref} className={`relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 ${heroFade.className}`}>
                        <span className="mb-6 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-300 backdrop-blur-sm">
                            ✨ Solusi Terpercaya untuk Sewa Lapangan
                        </span>

                        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
                            Sewa Lapangan Olahraga{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Lebih Cepat &amp; Mudah
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
                            Platform penyewaan lapangan olahraga terpercaya dengan ribuan pilihan lapangan berkualitas di seluruh Indonesia.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href="/venues" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 font-bold text-white shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-500/40 sm:w-auto">
                                Cari Lapangan Sekarang
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            {user ? (
                                <Link href="/dashboard" className="w-full rounded-xl border-2 border-white/30 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10 sm:w-auto">
                                    Ke Dashboard
                                </Link>
                            ) : (
                                <Link href="/register" className="w-full rounded-xl border-2 border-white/30 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10 sm:w-auto">
                                    Daftar Akun
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mx-auto mt-16 grid max-w-md grid-cols-3 gap-8">
                            {[['500+', 'Lapangan'], ['50K+', 'Pengguna'], ['4.8★', 'Rating']].map(([val, label]) => (
                                <div key={label} className="text-center">
                                    <div className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">{val}</div>
                                    <div className="mt-1 text-sm text-gray-400">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
                        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-2">
                            <div className="h-2 w-1 rounded-full bg-white/60" />
                        </div>
                    </div>
                </section>

                {/* ========== HOW IT WORKS ========== */}
                <section id="how-it-works" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div ref={howTitle.ref} className={`mb-16 text-center ${howTitle.className}`}>
                            <h2 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-5xl">Cara Kerja</h2>
                            <p className="mx-auto max-w-2xl text-lg text-gray-500">Proses yang simpel dan transparan untuk menyewa lapangan impian Anda.</p>
                        </div>

                        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
                            {/* connector line (desktop) */}
                            <div className="absolute left-[16.6%] right-[16.6%] top-[56px] hidden h-0.5 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200 md:block" />

                            {steps.map((s, i) => {
                                const Icon = s.icon;
                                return <StepCard key={i} num={s.num} title={s.title} desc={s.desc} icon={<Icon size={40} />} delay={i * 120} />;
                            })}
                        </div>
                    </div>
                </section>

                {/* ========== FEATURED VENUES ========== */}
                <section id="venues" className="bg-gray-50/80 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div ref={venueTitle.ref} className={`mb-16 text-center ${venueTitle.className}`}>
                            <h2 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-5xl">Lapangan Populer</h2>
                            <p className="mx-auto max-w-2xl text-lg text-gray-500">Pilihan lapangan terbaik dan paling banyak dipesan oleh pengguna kami.</p>
                        </div>

                        {featuredVenues.length > 0 ? (
                            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredVenues.map((venue, i) => (
                                    <FeaturedVenueCard key={venue.id} venue={venue} delay={i * 100} />
                                ))}
                            </div>
                        ) : (
                            /* Fallback jika belum ada venue di database */
                            <div className="mb-12 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">🏟️</div>
                                <p className="text-lg text-gray-400">Belum ada lapangan yang tersedia. Pantau terus!</p>
                            </div>
                        )}

                        <div className="text-center">
                            <Link href="/venues" className="group inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-8 py-4 font-bold text-emerald-600 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/20">
                                Lihat Semua Lapangan
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ========== CTA BANNER ========== */}
                <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div ref={ctaFade.ref} className={`mx-auto max-w-4xl ${ctaFade.className}`}>
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 text-center shadow-2xl sm:p-16">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                            <h2 className="relative mb-6 text-3xl font-extrabold text-white sm:text-5xl">Siap untuk Mulai?</h2>
                            <p className="relative mx-auto mb-10 max-w-2xl text-lg text-emerald-100">Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan menyewa lapangan olahraga.</p>
                            <Link href="/register" className="group relative inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-emerald-700 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
                                Daftar Gratis Sekarang
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ========== FOOTER ========== */}
                <footer className="bg-gray-900 px-4 py-16 text-gray-400 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
                            {/* Brand */}
                            <div>
                                <div className="mb-4 flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white">⚽</div>
                                    <span className="text-lg font-extrabold text-white">LapanganPro</span>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-500">Platform penyewaan lapangan olahraga terpercaya untuk semua kebutuhan Anda.</p>
                            </div>

                            {/* Produk */}
                            <div>
                                <h4 className="mb-4 font-bold text-white">Produk</h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li><a href="/venues" className="transition hover:text-emerald-400">Cari Lapangan</a></li>
                                    <li><a href="#how-it-works" className="transition hover:text-emerald-400">Cara Kerja</a></li>
                                    <li><a href="#" className="transition hover:text-emerald-400">Harga</a></li>
                                </ul>
                            </div>

                            {/* Perusahaan */}
                            <div>
                                <h4 className="mb-4 font-bold text-white">Perusahaan</h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li><a href="#" className="transition hover:text-emerald-400">Tentang Kami</a></li>
                                    <li><a href="#" className="transition hover:text-emerald-400">Blog</a></li>
                                    <li><a href="#" className="transition hover:text-emerald-400">Karir</a></li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="mb-4 font-bold text-white">Legal</h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li><a href="#" className="transition hover:text-emerald-400">Syarat &amp; Ketentuan</a></li>
                                    <li><a href="#" className="transition hover:text-emerald-400">Kebijakan Privasi</a></li>
                                    <li><a href="#" className="transition hover:text-emerald-400">Hubungi Kami</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 md:flex-row">
                            <p className="text-sm text-gray-500">© 2026 LapanganPro. Semua hak dilindungi.</p>
                            <div className="flex gap-3">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                    <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-emerald-600 hover:text-white">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/*  Step Card                                                          */
/* ------------------------------------------------------------------ */
function StepCard({ num, title, desc, icon, delay }: { num: string; title: string; desc: string; icon: React.ReactNode; delay: number }) {
    const fade = useFadeIn();
    return (
        <div ref={fade.ref} className={fade.className} style={{ transitionDelay: `${delay}ms` }}>
            <div className="group relative flex h-full flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* number circle */}
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-xl font-extrabold text-emerald-600 transition-all duration-300 group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                    {num}
                </div>
                {/* icon */}
                <div className="mb-5 text-emerald-600 transition-colors group-hover:text-teal-600">{icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Featured Venue Card (uses real DB data)                            */
/* ------------------------------------------------------------------ */
function FeaturedVenueCard({ venue, delay }: { venue: FeaturedVenue; delay: number }) {
    const fade = useFadeIn();
    const primaryType = venue.courts[0]?.type ?? 'Olahraga';

    return (
        <div ref={fade.ref} className={fade.className} style={{ transitionDelay: `${delay}ms` }}>
            <Link href={`/venues/${venue.id}`} className="group block h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-200 border border-transparent">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {venue.image ? (
                        <>
                            <img
                                src={`/uploads/venues/${venue.image}`}
                                alt={venue.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                            <span className="text-6xl opacity-40">{getSportIcon(primaryType)}</span>
                        </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        {getSportIcon(primaryType)} {primaryType}
                    </span>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="mb-1.5 text-base font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{venue.name}</h3>
                    <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} className="shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{venue.address}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                            <span className="text-xs text-gray-400">Mulai dari</span>
                            <div className="font-bold text-emerald-600">
                                {venue.min_price > 0 ? formatPrice(venue.min_price) : 'Hubungi Kami'}
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 transition-colors group-hover:text-emerald-600" />
                    </div>
                </div>
            </Link>
        </div>
    );
}
