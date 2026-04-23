<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
    public function index()
    {
        $bookings = Booking::with('user', 'court.venue')
            ->where('user_id', auth()->id())
            ->get();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Show booking form.
     */
    public function create(Court $court)
    {
        return Inertia::render('Bookings/Create', [
            'court' => $court->load('venue'),
        ]);
    }

    /**
     * Store a newly created booking.
     * 
     * Logika validasi: Cegah double booking dengan mengecek overlapping time slots.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id' => 'required|exists:courts,id',
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // Cek overlap dengan booking yang sudah ada
        $existingBooking = Booking::where('court_id', $validated['court_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                // Start time lebih kecil dari end time existing dan end time lebih besar dari start time existing
                $query->whereRaw('start_time < ?', [$validated['end_time']])
                    ->whereRaw('end_time > ?', [$validated['start_time']]);
            })
            ->first();

        if ($existingBooking) {
            return back()->withErrors([
                'booking_date' => 'Lapangan sudah dipesan pada jam tersebut. Silakan pilih jam lain.',
            ]);
        }

        // Hitung harga total
        $court = Court::find($validated['court_id']);
        $startTime = strtotime($validated['start_time']);
        $endTime = strtotime($validated['end_time']);
        $hours = ceil(($endTime - $startTime) / 3600);
        $totalPrice = $court->price_per_hour * $hours;

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'court_id' => $validated['court_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);

        return redirect()->route('bookings.index')->with('success', 'Booking berhasil dibuat!');
    }

    /**
     * Get available time slots untuk court tertentu pada tanggal tertentu.
     * Digunakan untuk menampilkan time slots yang belum dipesan di frontend.
     */
    public function getAvailableSlots(Court $court, $date)
    {
        $bookings = Booking::where('court_id', $court->id)
            ->where('booking_date', $date)
            ->where('status', '!=', 'cancelled')
            ->get(['start_time', 'end_time'])
            ->toArray();

        return response()->json([
            'available_slots' => $bookings,
        ]);
    }

    /**
     * Check availability untuk court pada tanggal tertentu.
     * Return array dari booked hours.
     * 
     * Query params:
     * - court_id: ID dari court
     * - booking_date: Tanggal (YYYY-MM-DD)
     */
    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'court_id' => 'required|exists:courts,id',
            'booking_date' => 'required|date_format:Y-m-d',
        ]);

        // Ambil semua booking untuk court & date tersebut yang tidak cancelled
        $bookings = Booking::where('court_id', $validated['court_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('status', '!=', 'cancelled')
            ->get(['start_time', 'end_time']);

        // Generate array dari booked hours
        $bookedSlots = [];

        foreach ($bookings as $booking) {
            // Parse start_time dan end_time
            $startHour = (int) explode(':', $booking->start_time)[0];
            $startMinute = (int) explode(':', $booking->start_time)[1];
            
            $endHour = (int) explode(':', $booking->end_time)[0];
            $endMinute = (int) explode(':', $booking->end_time)[1];

            // Generate semua jam yang booked (dari start_hour hingga end_hour)
            $currentHour = $startHour;
            while ($currentHour < $endHour) {
                $bookedSlots[] = [
                    'hour' => $currentHour,
                    'startTime' => sprintf('%02d:00', $currentHour),
                    'endTime' => sprintf('%02d:00', $currentHour + 1),
                ];
                $currentHour++;
            }
        }

        return response()->json([
            'court_id' => $validated['court_id'],
            'booking_date' => $validated['booking_date'],
            'booked_slots' => $bookedSlots,
        ]);
    }

    /**
     * Store payment proof untuk booking.
     * 
     * POST /bookings/{booking}/payment
     */
    public function storePayment(Request $request, Booking $booking)
    {
        // Validasi: hanya owner dari booking bisa upload bukti pembayaran
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Validasi file
        $validated = $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png|max:2048',
        ]);

        // Hapus file lama jika ada
        if ($booking->payment_proof && Storage::disk('public')->exists($booking->payment_proof)) {
            Storage::disk('public')->delete($booking->payment_proof);
        }

        // Simpan file baru ke folder 'payments' dengan nama unik (tanggal + booking id + random)
        $filename = 'payments/' . date('Ymd') . '_booking_' . $booking->id . '_' . uniqid() . '.jpg';
        Storage::disk('public')->put($filename, file_get_contents($validated['payment_proof']));

        // Update booking dengan path file payment_proof dan ubah status
        $booking->update([
            'payment_proof' => $filename,
            'status' => 'waiting_confirmation',
        ]);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Admin akan segera memverifikasi.');
    }
}
