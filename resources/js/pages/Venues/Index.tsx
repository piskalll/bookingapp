import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Search, MapPin, X, ArrowRight, SlidersHorizontal } from 'lucide-react';

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
    image: string | null;
    courts: Court[];
}

interface Props {
    venues: Venue[];
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
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="aspect-video animate-pulse bg-gray-200" />
            <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-gray-100" />
                <div className="border-t border-gray-100 pt-4">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Venue Card                                                         */
/* ------------------------------------------------------------------ */
function VenueCard({ venue, index }: { venue: Venue; index: number }) {
    const fade = useFadeIn(index * 80);
    const minPrice = venue.courts.length > 0
        ? Math.min(...venue.courts.map((c) => c.price_per_hour))
        : 0;
    const courtTypes = [...new Set(venue.courts.map((c) => c.type))];
    const primaryType = courtTypes[0] || 'Olahraga';

    return (
        <div ref={fade.ref} style={fade.style} className={fade.className}>
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600">
                    {venue.image ? (
                        <>
                            <img
                                src={`/uploads/venues/${venue.image}`}
                                alt={venue.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                            <span className="text-6xl opacity-40">{getSportIcon(primaryType)}</span>
                        </div>
                    )}

                    {/* Badge — top-left */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                        <span>{getSportIcon(primaryType)}</span>
                        <span>{primaryType}</span>
                    </div>

                    {/* Open badge — top-right */}
                    <div className="absolute right-3 top-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Buka
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                    {/* Name */}
                    <h3 className="mb-1.5 text-lg font-bold text-slate-800 transition-colors line-clamp-2 group-hover:text-emerald-600">
                        {venue.name}
                    </h3>

                    {/* Address */}
                    <div className="mb-3 flex items-start gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{venue.address}</span>
                    </div>

                    {/* Court types pills */}
                    {courtTypes.length > 1 && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                            {courtTypes.map((type) => (
                                <span key={type} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                    {type}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Price + CTA */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="mb-3 flex items-baseline justify-between">
                            <div>
                                <span className="text-xs text-slate-400">Mulai dari</span>
                                <div className="text-xl font-extrabold text-emerald-600">
                                    Rp {minPrice.toLocaleString('id-ID')}
                                    <span className="text-sm font-medium text-slate-400">/jam</span>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">{venue.courts.length} lapangan</span>
                        </div>

                        <Link
                            href={`/bookings/create/${venue.courts[0]?.id || 1}`}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group/btn"
                        >
                            Lihat Jadwal
                            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function VenuesIndex({ venues }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial load skeleton
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    // Derive unique court types for filter pills
    const allTypes = useMemo(() => {
        const types = new Set<string>();
        venues.forEach((v) => v.courts.forEach((c) => types.add(c.type)));
        return Array.from(types).sort();
    }, [venues]);

    const filterOptions = ['Semua', ...allTypes];

    // Filter venues
    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            const matchesSearch =
                searchQuery === '' ||
                venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                venue.address.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType =
                activeFilter === 'Semua' ||
                venue.courts.some((c) => c.type === activeFilter);

            return matchesSearch && matchesType;
        });
    }, [venues, searchQuery, activeFilter]);

    const headerFade = useFadeIn();

    return (
        <>
            <Head title="Cari Lapangan Olahraga" />

            <div className="min-h-screen bg-slate-50">
                {/* ========== HERO HEADER ========== */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 pb-32 pt-24">
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
                    <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px]" />

                    <div ref={headerFade.ref} className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${headerFade.className}`}>
                        <div className="text-center">
                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Temukan{' '}
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                    Lapangan Terbaik
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-slate-400">
                                Pesan lapangan olahraga favorit Anda dengan mudah. Harga terbaik, kenyamanan maksimal.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ========== STICKY SEARCH + FILTER BAR ========== */}
                <div className="sticky top-16 z-30">
                    <div className="-mt-16 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-5">
                            {/* Search input */}
                            <div className="relative mb-4">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input
                                    type="text"
                                    placeholder="Cari nama tempat atau lokasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-10 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Filter pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <SlidersHorizontal size={16} className="shrink-0 text-slate-400" />
                                {filterOptions.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveFilter(type)}
                                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                                            activeFilter === type
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {type !== 'Semua' && (
                                            <span className="mr-1">{getSportIcon(type)}</span>
                                        )}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== RESULTS ========== */}
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Results info bar */}
                    <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                {activeFilter === 'Semua' ? 'Semua Lapangan' : activeFilter}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {filteredVenues.length} tempat ditemukan
                                {searchQuery && (
                                    <> untuk "<span className="font-semibold text-slate-700">{searchQuery}</span>"</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Grid: skeleton or cards */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : filteredVenues.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredVenues.map((venue, i) => (
                                <VenueCard key={venue.id} venue={venue} index={i} />
                            ))}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="py-24 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <Search size={32} className="text-slate-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-900">Tempat tidak ditemukan</h3>
                            <p className="mb-6 text-slate-500">Coba ubah kata kunci pencarian atau filter Anda</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveFilter('Semua');
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
