import React, { useRef, useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapPin, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
}

interface Venue {
    id: number;
    name: string;
    address: string;
    description?: string;
    image: string | null;
    courts: Court[];
}

interface Props {
    venue: Venue;
}

/* ------------------------------------------------------------------ */
/*  Sport type → icon mapping                                          */
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
    return sportIcons[type.toLowerCase()] || '🏟️';
}

/* ------------------------------------------------------------------ */
/*  Fade-in on scroll hook                                             */
/* ------------------------------------------------------------------ */
function useFadeIn(delay = 0) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold: 0.1 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return {
        ref,
        style: { transitionDelay: `${delay}ms` } as React.CSSProperties,
        className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
    };
}

/* ------------------------------------------------------------------ */
/*  Court Card Component                                               */
/* ------------------------------------------------------------------ */
function CourtCard({ court, index }: { court: Court; index: number }) {
    const fade = useFadeIn(index * 100);

    return (
        <div ref={fade.ref} style={fade.style} className={fade.className}>
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200 p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl shadow-inner">
                            {getSportIcon(court.type)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{court.name}</h3>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                                {court.type}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 mb-6">
                    <p className="text-sm text-slate-500 line-clamp-2">
                        Lapangan berkualitas untuk {court.type}. Fasilitas lengkap, sirkulasi udara baik, dan penerangan memadai.
                    </p>
                    <ul className="mt-3 space-y-1 text-[13px] text-slate-600">
                        <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Lantai standar internasional</li>
                        <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Pencahayaan LED</li>
                    </ul>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-baseline justify-between">
                        <span className="text-xs font-medium text-slate-400 uppercase">Harga Sewa</span>
                        <div className="text-lg font-extrabold text-emerald-600">
                            Rp {court.price_per_hour.toLocaleString('id-ID')}
                            <span className="text-xs font-medium text-slate-400">/jam</span>
                        </div>
                    </div>

                    <Link
                        href={`/bookings/create/${court.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group/btn"
                    >
                        Lihat Jadwal
                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function VenueShow({ venue }: Props) {
    const headerFade = useFadeIn();
    
    // Check if venue has image, else default banner
    const bannerStyle = venue.image 
        ? { backgroundImage: `url('/uploads/venues/${venue.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <>
            <Head title={`Pilih Lapangan di ${venue.name}`} />

            <div className="min-h-screen bg-slate-50">
                {/* ========== HERO BANNER ========== */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 pb-20 pt-20" style={bannerStyle}>
                    {/* Overlay if there's an image */}
                    {venue.image && <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />}
                    
                    {/* Decorative blobs (if no image) */}
                    {!venue.image && (
                        <>
                            <div className="pointer-events-none absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[100px]" />
                            <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-400/20 blur-[100px]" />
                        </>
                    )}

                    <div className="absolute top-6 left-6 z-20">
                        <Link
                            href="/venues"
                            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ArrowLeft size={16} />
                            Kembali
                        </Link>
                    </div>

                    <div ref={headerFade.ref} className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 ${headerFade.className}`}>
                        <div className="text-center">
                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                {venue.name}
                            </h1>
                            <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-lg text-emerald-100">
                                <MapPin size={20} className="text-emerald-400" />
                                <span>{venue.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== CONTENT AREA ========== */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 -mt-10 relative z-20">
                    <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 mb-10 border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Daftar Lapangan</h2>
                                <p className="text-slate-500 mt-1">
                                    Terdapat {venue.courts.length} lapangan yang tersedia di {venue.name}. Silakan pilih lapangan untuk melihat jadwal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Courts Grid */}
                    {venue.courts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {venue.courts.map((court, i) => (
                                <CourtCard key={court.id} court={court} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                            <div className="text-4xl mb-3">🏟️</div>
                            <h3 className="text-lg font-bold text-slate-800">Belum ada lapangan</h3>
                            <p className="text-slate-500 mt-1">Venue ini belum memiliki lapangan yang dapat disewa.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
