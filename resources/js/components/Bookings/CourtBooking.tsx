import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { format, addDays, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    MapPin, Star, Clock, ArrowLeft, CheckCircle, Lock,
    ChevronLeft, ChevronRight, Wifi, Car, ShowerHead,
    LockKeyhole, Zap, Users,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
    venue: {
        id: number;
        name: string;
        address: string;
        image?: string | null;
    };
}

interface BookedSlot {
    hour: number;
    startTime: string;
    endTime: string;
}

interface CourtBookingProps {
    court: Court;
}

/* ------------------------------------------------------------------ */
/*  Sport icon helper                                                  */
/* ------------------------------------------------------------------ */
const sportIcons: Record<string, string> = {
    futsal: '⚽', badminton: '🏸', basket: '🏀', basketball: '🏀',
    tennis: '🎾', voli: '🏐', volleyball: '🏐',
};
function getSportIcon(type: string) {
    return sportIcons[type.toLowerCase()] || '🏟️';
}

/* ------------------------------------------------------------------ */
/*  Facilities (static for demo)                                       */
/* ------------------------------------------------------------------ */
const facilities = [
    { icon: Wifi, label: 'Wi-Fi Gratis' },
    { icon: Car, label: 'Parkir Luas' },
    { icon: ShowerHead, label: 'Ruang Shower' },
    { icon: LockKeyhole, label: 'Locker Aman' },
    { icon: Zap, label: 'Lampu LED' },
    { icon: Users, label: 'Tribun Penonton' },
];

/* ------------------------------------------------------------------ */
/*  Fade-in hook                                                       */
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
/*  Time Slot button                                                   */
/* ------------------------------------------------------------------ */
function TimeSlotBtn({
    time, state, onSelect,
}: {
    time: string;
    state: 'available' | 'selected' | 'booked';
    onSelect: () => void;
}) {
    if (state === 'booked') {
        return (
            <button disabled className="flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border-2 border-gray-100 bg-gray-100 px-3 py-3 text-sm font-semibold text-gray-400 line-through">
                {time}
                <Lock size={13} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition-all duration-200 active:scale-95 ${
                state === 'selected'
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40 ring-offset-2'
                    : 'border-gray-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
        >
            {time}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Horizontal Week Date Picker                                        */
/* ------------------------------------------------------------------ */
function WeekDatePicker({
    selectedDate, onSelect,
}: {
    selectedDate: Date;
    onSelect: (d: Date) => void;
}) {
    const [weekOffset, setWeekOffset] = useState(0);
    const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), weekOffset * 7 + i));

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                    {format(dates[0], 'MMM yyyy', { locale: idLocale })}
                </span>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((p) => Math.max(p - 1, 0))}
                        disabled={weekOffset === 0}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setWeekOffset((p) => p + 1)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    return (
                        <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => onSelect(date)}
                            className={`flex flex-col items-center rounded-xl px-1 py-2.5 text-center transition-all duration-200 ${
                                isSelected
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                    : isToday
                                      ? 'border-2 border-emerald-300 bg-emerald-50 text-emerald-700'
                                      : 'border-2 border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {format(date, 'EEE', { locale: idLocale })}
                            </span>
                            <span className="mt-0.5 text-lg font-extrabold leading-none">
                                {format(date, 'd')}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export default function CourtBooking({ court }: CourtBookingProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Build end_time from selected slots
    const sortedSlots = [...selectedSlots].sort();
    const firstSlot = sortedSlots[0] || '09:00';
    const lastSlot = sortedSlots[sortedSlots.length - 1] || '09:00';
    const lastHour = parseInt(lastSlot.split(':')[0]) + 1;
    const endTime = `${String(lastHour).padStart(2, '0')}:00`;

    const totalHours = selectedSlots.length;
    const totalPrice = totalHours * court.price_per_hour;

    const { data, setData, post, processing, errors } = useForm({
        court_id: court.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: firstSlot,
        end_time: endTime,
    });

    // Sync form data when selections change
    useEffect(() => {
        if (selectedSlots.length > 0) {
            const sorted = [...selectedSlots].sort();
            const last = sorted[sorted.length - 1];
            const endH = parseInt(last.split(':')[0]) + 1;
            setData((prev) => ({
                ...prev,
                booking_date: format(selectedDate, 'yyyy-MM-dd'),
                start_time: sorted[0],
                end_time: `${String(endH).padStart(2, '0')}:00`,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                booking_date: format(selectedDate, 'yyyy-MM-dd'),
            }));
        }
    }, [selectedSlots, selectedDate]);

    // Fetch booked slots whenever date changes
    const fetchAvailability = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const res = await fetch(
                `/api/bookings/check-availability?court_id=${court.id}&booking_date=${dateStr}`,
            );
            if (res.ok) {
                const json = await res.json();
                const booked = (json.booked_slots || []).map((s: BookedSlot) => s.startTime);
                setBookedSlots(booked);
            }
        } catch {
            // silently fail
        } finally {
            setLoadingSlots(false);
        }
    }, [selectedDate, court.id]);

    useEffect(() => {
        fetchAvailability();
        setSelectedSlots([]); // reset selection on date change
    }, [fetchAvailability]);

    // Generate time slots 06:00 – 21:00
    const timeSlots = Array.from({ length: 16 }, (_, i) => {
        const hour = 6 + i;
        return `${String(hour).padStart(2, '0')}:00`;
    });

    // Toggle slot selection (only allow consecutive)
    const toggleSlot = (time: string) => {
        setSelectedSlots((prev) => {
            if (prev.includes(time)) {
                return prev.filter((t) => t !== time);
            }
            const next = [...prev, time].sort();
            // Validate consecutive
            for (let i = 1; i < next.length; i++) {
                const prevH = parseInt(next[i - 1].split(':')[0]);
                const currH = parseInt(next[i].split(':')[0]);
                if (currH - prevH !== 1) {
                    // Not consecutive: replace selection with just the clicked slot
                    return [time];
                }
            }
            return next;
        });
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSlots.length === 0) return;
        post('/bookings', {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.href = '/bookings';
                }, 2000);
            },
        });
    };

    const infoFade = useFadeIn();
    const galleryFade = useFadeIn(100);

    return (
        <>
            <Head title={`Pesan ${court.name}`} />

            <div className="min-h-screen bg-slate-50">
                {/* ===== HERO BANNER ===== */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-900 to-emerald-950 sm:h-72">
                    {court.venue.image ? (
                        <>
                            <img
                                src={`/uploads/venues/${court.venue.image}`}
                                alt={court.venue.name}
                                className="h-full w-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 opacity-80" />
                    )}

                    {/* Back nav */}
                    <div className="absolute left-0 right-0 top-0 z-10 px-4 pt-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <Link
                                href="/venues"
                                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                <ArrowLeft size={16} />
                                Kembali
                            </Link>
                        </div>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                                {getSportIcon(court.type)} {court.type}
                            </span>
                            <h1 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">{court.name}</h1>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                                <MapPin size={14} />
                                <span>{court.venue.name} — {court.venue.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT: SPLIT LAYOUT ===== */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                        {/* ────── LEFT COLUMN: Info ────── */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Gallery placeholder */}
                            <div ref={galleryFade.ref} style={galleryFade.style} className={galleryFade.className}>
                                <div className="overflow-hidden rounded-2xl shadow-lg">
                                    {court.venue.image ? (
                                        <img
                                            src={`/uploads/venues/${court.venue.image}`}
                                            alt={court.venue.name}
                                            className="aspect-video w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                            <span className="text-8xl opacity-30">{getSportIcon(court.type)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info card */}
                            <div ref={infoFade.ref} style={infoFade.style} className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 ${infoFade.className}`}>
                                {/* Stats row */}
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-xl bg-emerald-50 p-4 text-center">
                                        <div className="text-xl font-extrabold capitalize text-emerald-600">{court.type}</div>
                                        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jenis</div>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 p-4 text-center">
                                        <div className="text-xl font-extrabold text-emerald-600">
                                            Rp {court.price_per_hour.toLocaleString('id-ID')}
                                        </div>
                                        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Per Jam</div>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rating</div>
                                    </div>
                                    <div className="rounded-xl bg-blue-50 p-4 text-center">
                                        <div className="text-xl font-extrabold text-blue-600">4.8</div>
                                        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Skor</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="mb-2 text-lg font-bold text-slate-900">Tentang Lapangan</h3>
                                    <p className="leading-relaxed text-slate-500">
                                        Lapangan {court.type} berkualitas tinggi dengan standar internasional.
                                        Dilengkapi dengan pencahayaan LED profesional, lantai berkualitas premium,
                                        dan lingkungan yang nyaman untuk bermain bersama teman maupun tim Anda.
                                    </p>
                                </div>

                                {/* Facilities */}
                                <div>
                                    <h3 className="mb-3 text-lg font-bold text-slate-900">Fasilitas</h3>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {facilities.map((f) => (
                                            <div
                                                key={f.label}
                                                className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                                            >
                                                <f.icon size={18} className="shrink-0 text-emerald-500" />
                                                <span className="font-medium">{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Operating hours */}
                                <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <Clock size={18} className="mt-0.5 shrink-0 text-blue-500" />
                                    <div className="text-sm">
                                        <p className="font-bold text-blue-900">Jam Operasional</p>
                                        <p className="text-blue-700">06:00 – 22:00 WIB, Buka Setiap Hari</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ────── RIGHT COLUMN: Sticky Booking Panel ────── */}
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-20">
                                <form
                                    onSubmit={handleSubmit}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
                                >
                                    {/* Panel header */}
                                    <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                                        <h2 className="text-lg font-extrabold text-white">Pesan Lapangan</h2>
                                        <p className="text-sm text-emerald-100">Pilih tanggal dan jam bermain Anda</p>
                                    </div>

                                    <div className="space-y-5 p-5 sm:p-6">
                                        {/* Date picker */}
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-800">
                                                📅 Pilih Tanggal
                                            </label>
                                            <WeekDatePicker
                                                selectedDate={selectedDate}
                                                onSelect={handleDateChange}
                                            />
                                        </div>

                                        {/* Time slots */}
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-800">
                                                🕐 Pilih Jam
                                            </label>

                                            {loadingSlots ? (
                                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                    {Array.from({ length: 12 }).map((_, i) => (
                                                        <div key={i} className="h-11 animate-pulse rounded-xl bg-gray-100" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                    {timeSlots.map((time) => {
                                                        const isBooked = bookedSlots.includes(time);
                                                        const isSelected = selectedSlots.includes(time);
                                                        return (
                                                            <TimeSlotBtn
                                                                key={time}
                                                                time={time}
                                                                state={isBooked ? 'booked' : isSelected ? 'selected' : 'available'}
                                                                onSelect={() => toggleSlot(time)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Legend */}
                                            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-3 w-3 rounded border border-gray-200 bg-white" /> Tersedia
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-3 w-3 rounded bg-emerald-500" /> Dipilih
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-3 w-3 rounded bg-gray-200" /> Penuh
                                                </span>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        {selectedSlots.length > 0 && (
                                            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                                                <h4 className="mb-3 text-sm font-bold text-slate-800">Ringkasan Pesanan</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Tanggal</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {format(selectedDate, 'dd MMMM yyyy', { locale: idLocale })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Waktu</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {sortedSlots[0]} – {endTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Durasi</span>
                                                        <span className="font-semibold text-slate-800">{totalHours} Jam</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-emerald-200 pt-2">
                                                        <span className="text-slate-500">Harga/Jam</span>
                                                        <span className="font-semibold text-slate-600">
                                                            Rp {court.price_per_hour.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-base font-bold text-slate-900">Total Bayar</span>
                                                        <span className="text-base font-extrabold text-emerald-600">
                                                            Rp {totalPrice.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Errors */}
                                        {(errors.start_time || errors.booking_date) && (
                                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                {errors.start_time || errors.booking_date}
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={processing || selectedSlots.length === 0}
                                            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing
                                                ? 'Memproses...'
                                                : selectedSlots.length === 0
                                                  ? 'Pilih Jam Terlebih Dahulu'
                                                  : `Lanjutkan Pembayaran — Rp ${totalPrice.toLocaleString('id-ID')}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SUCCESS MODAL ===== */}
                {showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle size={36} className="text-emerald-500" />
                            </div>
                            <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Pesanan Berhasil!</h3>
                            <p className="text-sm text-slate-500">
                                Lapangan Anda telah dipesan. Anda akan dialihkan ke halaman pembayaran...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
