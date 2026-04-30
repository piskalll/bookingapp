<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the owner dashboard with statistics and recent bookings.
     */
    public function index()
    {
        $userId = Auth::id();
        $currentMonth = Carbon::now();

        // Total venues milik owner
        $totalVenues = Auth::user()->venues()->count();

        // Total courts dari semua venues milik owner
        $totalCourts = Auth::user()
            ->venues()
            ->with('courts')
            ->get()
            ->sum(function ($venue) {
                return $venue->courts->count();
            });

        // Monthly revenue (sum dari total_price booking berstatus 'confirmed' bulan ini)
        $monthlyRevenue = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->where('venues.user_id', $userId)
            ->where('bookings.status', 'confirmed')
            ->whereYear('bookings.booking_date', $currentMonth->year)
            ->whereMonth('bookings.booking_date', $currentMonth->month)
            ->sum('bookings.total_price');

        // Pending bookings count (status 'pending' dan sudah ada payment_proof)
        $pendingBookingsCount = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->where('venues.user_id', $userId)
            ->where('bookings.status', 'pending')
            ->whereNotNull('bookings.payment_proof')
            ->count();

        // Recent bookings (5 data terbaru) - khusus lapangan milik owner
        $recentBookings = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->select(
                'bookings.id',
                'users.name as customer_name',
                'courts.name as court_name',
                'bookings.booking_date',
                'bookings.start_time',
                'bookings.end_time',
                'bookings.total_price',
                'bookings.status',
                'bookings.created_at'
            )
            ->where('venues.user_id', $userId)
            ->orderBy('bookings.created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->customer_name,
                    'court_name' => $booking->court_name,
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'total_price' => (int) $booking->total_price,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at,
                ];
            });

        return Inertia::render('Owner/Dashboard', [
            'statistics' => [
                'total_venues' => $totalVenues,
                'total_courts' => $totalCourts,
                'monthly_revenue' => (int) $monthlyRevenue,
                'pending_bookings_count' => $pendingBookingsCount,
            ],
            'recent_bookings' => $recentBookings->toArray(),
        ]);
    }
}
