<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
    public function index()
    {
        $bookings = Booking::with('user', 'court.venue')
            ->where('user_id', auth()->id())
            ->latest()
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
     * Store a newly created booking dan generate Midtrans Snap Token.
     *
     * Logika validasi: Cegah double booking dengan mengecek overlapping time slots.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id'     => 'required|exists:courts,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
        ]);

        $lockKey = 'booking_court_' . $validated['court_id'] . '_' . $validated['booking_date'] . '_' . $validated['start_time'];

        // Mengunci proses selama 10 detik. Jika ada request lain masuk dengan key yang sama, dia harus antre/ditolak.
        $lock = Cache::lock($lockKey, 10);

        if ($lock->get()) {
            try {
                // --- Cek Double Booking ---
                $existingBooking = Booking::where('court_id', $validated['court_id'])
                    ->where('booking_date', $validated['booking_date'])
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($validated) {
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
                $court     = Court::with('venue.owner')->find($validated['court_id']);
                $startTime = strtotime($validated['start_time']);
                $endTime   = strtotime($validated['end_time']);
                $hours     = ceil(($endTime - $startTime) / 3600);
                $totalPrice = $court->price_per_hour * $hours;

                // ── Logika Komisi ──
                $commissionRate = $court->venue?->owner?->commission_rate ?? 5.00;
                $adminFee       = (int) round(($totalPrice * $commissionRate) / 100);
                $ownerRevenue   = $totalPrice - $adminFee;

                // Insert ke database
                $booking = Booking::create([
                    'user_id'       => auth()->id(),
                    'court_id'      => $validated['court_id'],
                    'booking_date'  => $validated['booking_date'],
                    'start_time'    => $validated['start_time'],
                    'end_time'      => $validated['end_time'],
                    'total_price'   => $totalPrice,
                    'admin_fee'     => $adminFee,
                    'owner_revenue' => $ownerRevenue,
                    'status'        => 'pending',
                ]);

                // ── Generate Midtrans Snap Token ──
                $snapToken = $this->generateSnapToken($booking, $court);
                if ($snapToken) {
                    $booking->update(['snap_token' => $snapToken]);
                }

                return redirect()->route('bookings.index')->with('success', 'Booking berhasil dibuat! Silakan lanjutkan pembayaran.');

            } finally {
                $lock->release();
            }
        } else {
            return back()->withErrors([
                'booking_date' => 'Sistem sedang memproses pesanan lain untuk jadwal ini. Silakan coba lagi dalam beberapa detik.',
            ]);
        }
    }

    /**
     * Generate Midtrans Snap Token untuk booking.
     */
    private function generateSnapToken(Booking $booking, Court $court): ?string
    {
        try {
            MidtransConfig::$serverKey    = config('midtrans.server_key');
            MidtransConfig::$isProduction = config('midtrans.is_production');
            MidtransConfig::$isSanitized  = config('midtrans.is_sanitized');
            MidtransConfig::$is3ds        = config('midtrans.is_3ds');

            $user = auth()->user();

            // Pisah nama depan dan belakang (untuk parameter Midtrans)
            $nameParts = explode(' ', $user->name, 2);
            $firstName = $nameParts[0];
            $lastName  = $nameParts[1] ?? '';

            $params = [
                'transaction_details' => [
                    'order_id'     => 'BOOK-' . $booking->id . '-' . time(),
                    'gross_amount' => (int) $booking->total_price,
                ],
                'customer_details' => [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'email'      => $user->email,
                ],
                'item_details' => [
                    [
                        'id'       => 'COURT-' . $court->id,
                        'price'    => (int) $booking->total_price,
                        'quantity' => 1,
                        'name'     => substr($court->name . ' - ' . $booking->booking_date, 0, 50),
                    ],
                ],
                'callbacks' => [
                    'finish' => route('bookings.index'),
                ],
            ];

            return Snap::getSnapToken($params);

        } catch (\Exception $e) {
            Log::error('Midtrans Snap Token Error: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
            ]);

            return null;
        }
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
     */
    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'court_id'     => 'required|exists:courts,id',
            'booking_date' => 'required|date_format:Y-m-d',
        ]);

        $bookings = Booking::where('court_id', $validated['court_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('status', '!=', 'cancelled')
            ->get(['start_time', 'end_time']);

        $bookedSlots = [];

        foreach ($bookings as $booking) {
            $startHour   = (int) explode(':', $booking->start_time)[0];
            $endHour     = (int) explode(':', $booking->end_time)[0];
            $currentHour = $startHour;

            while ($currentHour < $endHour) {
                $bookedSlots[] = [
                    'hour'      => $currentHour,
                    'startTime' => sprintf('%02d:00', $currentHour),
                    'endTime'   => sprintf('%02d:00', $currentHour + 1),
                ];
                $currentHour++;
            }
        }

        return response()->json([
            'court_id'     => $validated['court_id'],
            'booking_date' => $validated['booking_date'],
            'booked_slots' => $bookedSlots,
        ]);
    }
}
