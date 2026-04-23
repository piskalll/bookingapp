import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvailableSlot {
    start_time: string;
    end_time: string;
}

interface BookingCalendarProps {
    courtId: number;
    onDateSelect: (date: string, startTime: string, endTime: string) => void;
    selectedDate?: string;
    selectedStartTime?: string;
    selectedEndTime?: string;
}

export default function BookingCalendar({
    courtId,
    onDateSelect,
    selectedDate = '',
    selectedStartTime = '',
    selectedEndTime = '',
}: BookingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateState, setSelectedDateState] = useState(selectedDate);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<AvailableSlot[]>([]);
    const [selectedStartTimeState, setSelectedStartTimeState] = useState(selectedStartTime);
    const [selectedEndTimeState, setSelectedEndTimeState] = useState(selectedEndTime);

    // Generate time slots (07:00 - 22:00 with 1-hour intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour < 22; hour++) {
            slots.push(`${String(hour).padStart(2, '0')}:00`);
        }
        return slots;
    };

    // Fetch booked slots for selected date
    const fetchBookedSlots = async (date: string) => {
        try {
            const response = await fetch(
                route('api.bookings.available-slots', { court: courtId, date }),
            );
            const data = await response.json();
            setBookedSlots(data.available_slots || []);
        } catch (error) {
            console.error('Error fetching booked slots:', error);
        }
    };

    useEffect(() => {
        setTimeSlots(generateTimeSlots());
    }, []);

    useEffect(() => {
        if (selectedDateState) {
            fetchBookedSlots(selectedDateState);
        }
    }, [selectedDateState]);

    // Check if a time slot is disabled (overlap dengan booked slots)
    const isTimeSlotDisabled = (time: string): boolean => {
        return bookedSlots.some((slot) => {
            const currentTime = new Date(`2000-01-01 ${time}`);
            const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000);

            const slotStart = new Date(`2000-01-01 ${slot.start_time}`);
            const slotEnd = new Date(`2000-01-01 ${slot.end_time}`);

            // Check overlap
            return currentTime < slotEnd && nextHour > slotStart;
        });
    };

    // Generate selectable dates (7 days from now)
    const generateSelectableDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const selectableDates = generateSelectableDates();

    const handleDateClick = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setSelectedDateState(formattedDate);
    };

    const handleTimeRangeSelect = (startTime: string) => {
        if (isTimeSlotDisabled(startTime)) {
            return;
        }

        // Generate end time (1 hour after start time)
        const [hours, minutes] = startTime.split(':');
        const endHour = String((parseInt(hours) + 1) % 24).padStart(2, '0');
        const endTime = `${endHour}:${minutes}`;

        setSelectedStartTimeState(startTime);
        setSelectedEndTimeState(endTime);

        if (selectedDateState) {
            onDateSelect(selectedDateState, startTime, endTime);
        }
    };

    const formatDateDisplay = (date: Date): string => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Pilih Tanggal & Jam</h3>

            {/* Date Picker */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Tanggal</h4>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {selectableDates.map((date) => {
                        const formattedDate = date.toISOString().split('T')[0];
                        const isSelected = selectedDateState === formattedDate;

                        return (
                            <button
                                key={formattedDate}
                                onClick={() => handleDateClick(date)}
                                className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <div className="text-xs font-semibold">
                                    {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                                </div>
                                <div className="text-lg font-bold">
                                    {date.getDate()}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Picker */}
            {selectedDateState && (
                <div>
                    <h4 className="font-medium text-gray-700 mb-3">Jam</h4>

                    {/* Info tentang booked slots */}
                    {bookedSlots.length > 0 && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            <p className="font-medium mb-1">Jam yang sudah dipesan:</p>
                            <p>
                                {bookedSlots
                                    .map((slot) => `${slot.start_time} - ${slot.end_time}`)
                                    .join(', ')}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((time) => {
                            const isDisabled = isTimeSlotDisabled(time);
                            const isSelected = selectedStartTimeState === time;

                            return (
                                <button
                                    key={time}
                                    onClick={() => handleTimeRangeSelect(time)}
                                    disabled={isDisabled}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                                        isDisabled
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                            : isSelected
                                              ? 'bg-green-600 text-white shadow-lg'
                                              : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                                    }`}
                                    title={isDisabled ? 'Jam sudah dipesan' : ''}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Summary */}
            {selectedDateState && selectedStartTimeState && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Ringkasan Pemesanan:</h4>
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Tanggal:</span>{' '}
                        {new Date(selectedDateState).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Jam:</span> {selectedStartTimeState} -{' '}
                        {selectedEndTimeState}
                    </p>
                </div>
            )}
        </div>
    );
}
