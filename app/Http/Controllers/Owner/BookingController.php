<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a list of all bookings for the owner's venues.
     */
    public function index()
    {
        $userId = Auth::id();

        // Get all bookings for venues belonging to the owner
        $bookings = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->select(
                'bookings.id',
                'users.name as customer_name',
                'users.email as customer_email',
                'courts.name as court_name',
                'venues.name as venue_name',
                'bookings.booking_date',
                'bookings.start_time',
                'bookings.end_time',
                'bookings.total_price',
                'bookings.admin_fee',
                'bookings.owner_revenue',
                'bookings.status',
                'bookings.booking_code',
                'bookings.payment_proof',
                'bookings.created_at'
            )
            ->where('venues.user_id', $userId)
            ->orderBy('bookings.booking_date', 'desc')
            ->orderBy('bookings.start_time', 'desc')
            ->paginate(15)
            ->toArray();

        return Inertia::render('Owner/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Approve booking - set status to confirmed and generate booking_code.
     */
    public function approve($id)
    {
        $booking = Booking::find($id);
        if (!$booking) {
            abort(404);
        }

        // Verify ownership
        $court = DB::table('courts')->where('id', $booking->court_id)->first();
        $venue = DB::table('venues')->where('id', $court->venue_id)->first();
        if ($venue->user_id !== Auth::id()) {
            abort(403);
        }

        $updates = ['status' => 'confirmed'];
        if (empty($booking->booking_code)) {
            $updates['booking_code'] = Booking::generateBookingCode($booking->id);
        }

        $booking->update($updates);

        return back()->with('success', 'Pesanan telah dikonfirmasi dan kode booking diterbitkan.');
    }

    /**
     * Reject booking - set status to cancelled.
     */
    public function reject($id)
    {
        $booking = Booking::find($id);
        if (!$booking) {
            abort(404);
        }

        // Verify ownership
        $court = DB::table('courts')->where('id', $booking->court_id)->first();
        $venue = DB::table('venues')->where('id', $court->venue_id)->first();
        if ($venue->user_id !== Auth::id()) {
            abort(403);
        }

        $booking->update(['status' => 'cancelled']);

        return back()->with('success', 'Pesanan telah ditolak.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Verifikasi Kode Booking
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tampilkan halaman verifikasi kode booking.
     */
    public function verificationPage()
    {
        return Inertia::render('Owner/Verification');
    }

    /**
     * API: Verifikasi kode booking yang diinput owner.
     *
     * Rules:
     * - Kode harus ditemukan di tabel bookings.
     * - Status booking harus 'confirmed'.
     * - Lapangan harus milik venue yang di-assign ke owner ini.
     * - Jika valid, kembalikan data lengkap + flag is_today (apakah tanggal bermain = hari ini).
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string|max:30',
        ]);

        $ownerId = Auth::id();
        $code    = strtoupper(trim($request->booking_code));

        // Cari booking beserta relasi venue & customer
        $booking = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->join('users as customers', 'bookings.user_id', '=', 'customers.id')
            ->select(
                'bookings.id',
                'bookings.booking_code',
                'bookings.booking_date',
                'bookings.start_time',
                'bookings.end_time',
                'bookings.total_price',
                'bookings.admin_fee',
                'bookings.status',
                'bookings.created_at',
                'courts.name as court_name',
                'courts.type as court_type',
                'venues.name as venue_name',
                'venues.address as venue_address',
                'customers.name as customer_name',
                'customers.email as customer_email',
            )
            ->where('bookings.booking_code', $code)
            ->first();

        // Kode tidak ditemukan
        if (!$booking) {
            return response()->json([
                'valid'   => false,
                'message' => 'Kode booking tidak ditemukan. Pastikan kode sudah benar.',
            ], 404);
        }

        // Status bukan confirmed
        if ($booking->status !== 'confirmed') {
            return response()->json([
                'valid'   => false,
                'message' => 'Kode ditemukan, tetapi pesanan ini belum dibayar atau sudah dibatalkan.',
                'status'  => $booking->status,
            ], 422);
        }

        // Verifikasi kepemilikan venue — owner hanya bisa scan booking di venuenya sendiri
        $venueOwner = DB::table('venues')
            ->join('courts', 'venues.id', '=', 'courts.venue_id')
            ->where('courts.name', $booking->court_name)
            ->where('venues.name', $booking->venue_name)
            ->where('venues.user_id', $ownerId)
            ->exists();

        if (!$venueOwner) {
            return response()->json([
                'valid'   => false,
                'message' => 'Kode valid, namun pesanan ini bukan untuk lapangan Anda.',
            ], 403);
        }

        // Hitung apakah tanggal bermain = hari ini
        $isToday = $booking->booking_date === now()->toDateString();

        // Hitung durasi
        $start    = strtotime($booking->start_time);
        $end      = strtotime($booking->end_time);
        $duration = (int) round(($end - $start) / 3600);

        return response()->json([
            'valid'    => true,
            'is_today' => $isToday,
            'booking'  => [
                'id'            => $booking->id,
                'booking_code'  => $booking->booking_code,
                'booking_date'  => $booking->booking_date,
                'start_time'    => $booking->start_time,
                'end_time'      => $booking->end_time,
                'duration_hours'=> $duration,
                'total_price'   => $booking->total_price,
                'admin_fee'     => $booking->admin_fee,
                'status'        => $booking->status,
                'court_name'    => $booking->court_name,
                'court_type'    => $booking->court_type,
                'venue_name'    => $booking->venue_name,
                'venue_address' => $booking->venue_address,
                'customer_name' => $booking->customer_name,
                'customer_email'=> $booking->customer_email,
                'created_at'    => $booking->created_at,
            ],
        ]);
    }
}
