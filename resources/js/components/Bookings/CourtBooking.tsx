import { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import { format, parse, isBefore, startOfToday, addDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { store as storeBooking } from '@/routes/bookings';

interface CourtBookingProps {
    court: {
        id: number;
        name: string;
        type: string;
        price_per_hour: number;
        venue: {
            id: number;
            name: string;
            address: string;
        };
    };
}

interface BookedSlot {
    hour: number;
    startTime: string;
    endTime: string;
}

const OPERATING_HOURS = Array.from({ length: 15 }, (_, i) => {
    const hour = 8 + i; // 08:00 hingga 22:00
    return {
        hour,
        startTime: `${String(hour).padStart(2, '0')}:00`,
        endTime: `${String(hour + 1).padStart(2, '0')}:00`,
    };
});

export default function CourtBooking({ court }: CourtBookingProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        court_id: court.id,
        booking_date: '',
        start_time: '',
        end_time: '',
    });

    // Fetch booked slots ketika date berubah
    useEffect(() => {
        if (selectedDate) {
            fetchBookedSlots(selectedDate);
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            setData('booking_date', formattedDate);
        }
    }, [selectedDate]);

    // Update end_time ketika start_time berubah
    useEffect(() => {
        if (selectedStartTime) {
            const [hour] = selectedStartTime.split(':');
            const endHour = String(parseInt(hour) + 1).padStart(2, '0');
            const endTime = `${endHour}:00`;
            setSelectedEndTime(endTime);
            setData({
                court_id: court.id,
                booking_date: data.booking_date,
                start_time: selectedStartTime,
                end_time: endTime,
            });
        }
    }, [selectedStartTime]);

    const fetchBookedSlots = async (date: Date) => {
        setLoading(true);
        setError(null);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await fetch(
                `/api/bookings/check-availability?court_id=${court.id}&booking_date=${formattedDate}`,
            );

            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const result = await response.json();
            setBookedSlots(result.booked_slots || []);
            setSelectedStartTime(null);
            setSelectedEndTime(null);
        } catch (err) {
            setError('Gagal mengambil data ketersediaan. Silakan coba lagi.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isSlotBooked = (hour: number): boolean => {
        return bookedSlots.some((slot) => slot.hour === hour);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
            setError('Silakan pilih tanggal dan jam terlebih dahulu.');
            return;
        }

        // Ensure data is complete before submitting
        const finalData = {
            court_id: court.id,
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: selectedStartTime,
            end_time: selectedEndTime,
        };

        post(storeBooking(), {
            data: finalData,
            onError: (errors) => {
                console.error('Booking errors:', errors);
                setError(errors.booking_date || 'Terjadi kesalahan. Silakan coba lagi.');
            },
            onSuccess: () => {
                console.log('Booking berhasil dibuat');
            },
        });
    };

    const calculateTotalPrice = (): number => {
        if (!selectedStartTime || !selectedEndTime) return 0;

        const [startHour] = selectedStartTime.split(':');
        const [endHour] = selectedEndTime.split(':');
        const hours = parseInt(endHour) - parseInt(startHour);

        return court.price_per_hour * hours;
    };

    const minDate = addDays(startOfToday(), 1);
    const maxDate = addDays(startOfToday(), 7);

    const totalPrice = calculateTotalPrice();

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Court Info Card */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{court.name}</h2>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold">Venue:</span> {court.venue.name}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Lokasi:</span> {court.venue.address}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Tipe:</span>{' '}
                                <span className="capitalize px-2 py-1 bg-blue-200 text-blue-800 rounded">
                                    {court.type}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-end">
                        <p className="text-gray-600 mb-2">Harga per jam</p>
                        <p className="text-4xl font-bold text-blue-600">
                            Rp {court.price_per_hour.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Durasi minimum: 1 jam</p>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <span className="text-red-600 flex-shrink-0 text-xl">⚠️</span>
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Picker Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tanggal</h3>

                    <div className="flex justify-center mb-6">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            minDate={minDate}
                            maxDate={maxDate}
                            dateFormat="dd MMMM yyyy"
                            locale={idLocale}
                            inline
                            calendarClassName="border border-gray-200 rounded-lg shadow-lg"
                            className="p-3 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {selectedDate && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <p className="text-blue-900">
                                Tanggal dipilih:{' '}
                                <span className="font-semibold">
                                    {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Time Slots Section */}
                {selectedDate && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jam Operasional</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Jam operasional: 08:00 - 23:00 | Durasi minimal: 1 jam
                        </p>

                        {loading && (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin text-3xl">⏳</div>
                                <p className="text-gray-600 mt-2">Memuat ketersediaan...</p>
                            </div>
                        )}

                        {!loading && (
                            <>
                                {/* Info Booked Slots */}
                                {bookedSlots.length > 0 && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <h4 className="font-semibold text-amber-900 mb-2">Jam yang sudah dipesan:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {bookedSlots.map((slot, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-amber-200 text-amber-800 rounded text-sm"
                                                >
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Time Slots Grid */}
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {OPERATING_HOURS.map((slot) => {
                                        const isBooked = isSlotBooked(slot.hour);
                                        const isSelected = selectedStartTime === slot.startTime;

                                        return (
                                            <button
                                                key={slot.hour}
                                                type="button"
                                                onClick={() => !isBooked && setSelectedStartTime(slot.startTime)}
                                                disabled={isBooked}
                                                className={`p-3 rounded-lg font-medium transition-all ${
                                                    isBooked
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                                        : isSelected
                                                          ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400'
                                                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                                }`}
                                                title={isBooked ? 'Jam sudah dipesan' : ''}
                                            >
                                                <div className="text-sm">{slot.startTime}</div>
                                                <div className="text-xs opacity-75">
                                                    {isBooked ? 'Penuh' : isSelected ? 'Dipilih' : 'Kosong'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Selected Time Summary */}
                {selectedDate && selectedStartTime && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <span className="text-green-600 flex-shrink-0 mt-1 text-xl">✅</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-green-900 mb-3">Ringkasan Pemesanan</h4>
                                <div className="space-y-2 mb-4">
                                    <p className="text-green-800">
                                        <span className="font-medium">Tanggal:</span>{' '}
                                        {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                                    </p>
                                    <p className="text-green-800">
                                        <span className="font-medium">Jam:</span> {selectedStartTime} -
                                        {selectedEndTime}
                                    </p>
                                    <p className="text-green-800">
                                        <span className="font-medium">Durasi:</span> 1 jam
                                    </p>
                                </div>

                                <div className="border-t border-green-200 pt-3">
                                    <p className="text-green-800 mb-2">
                                        <span className="font-medium">Total Harga:</span>
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        Rp {totalPrice.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Errors */}
                {(Object.keys(errors).length > 0 || Object.keys(data).some((key) => data[key as keyof typeof data] === '')) && !selectedDate && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            Silakan pilih tanggal dan jam terlebih dahulu
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <Link href="/venues" className="flex-1">
                        <Button variant="outline" className="w-full h-12">
                            ← Kembali ke Daftar
                        </Button>
                    </Link>

                    <button
                        type="submit"
                        disabled={processing || !selectedDate || !selectedStartTime || loading}
                        className={`flex-1 h-12 font-semibold rounded-lg transition-all ${
                            processing || !selectedDate || !selectedStartTime || loading
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {processing ? 'Memproses...' : 'Konfirmasi Pemesanan'}
                    </button>
                </div>
            </form>

            {/* Custom DatePicker Styles */}
            <style>{`
                .react-datepicker {
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    font-family: inherit;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .react-datepicker__header {
                    background-color: #2563eb;
                    border-radius: 0.5rem 0.5rem 0 0;
                    color: white;
                    padding: 1rem;
                    border-bottom: 0;
                }

                .react-datepicker__current-month {
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .react-datepicker__navigation-icon::before {
                    border-color: white;
                }

                .react-datepicker__day-names {
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .react-datepicker__day--selected,
                .react-datepicker__day--in-selecting-range,
                .react-datepicker__day--in-range {
                    background-color: #10b981;
                    color: white;
                    border-radius: 0.375rem;
                }

                .react-datepicker__day--disabled {
                    background-color: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
                    background-color: #dbeafe;
                    border-radius: 0.375rem;
                }

                .react-datepicker__day-name,
                .react-datepicker__day {
                    width: 2.5rem;
                    line-height: 2.5rem;
                    margin: 0.1rem;
                    border-radius: 0.375rem;
                }
            `}</style>
        </div>
    );
}
