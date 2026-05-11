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
        $user   = Auth::user();
        $userId = $user->id;
        $currentMonth = Carbon::now();

        // Total venues milik owner
        $totalVenues = $user->venues()->count();

        // Total courts dari semua venues milik owner
        $totalCourts = $user->venues()->with('courts')->get()
            ->sum(fn($venue) => $venue->courts->count());

        // Pendapatan BERSIH owner bulan ini (sum owner_revenue, bukan total_price)
        $monthlyRevenue = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->where('venues.user_id', $userId)
            ->where('bookings.status', 'confirmed')
            ->whereYear('bookings.booking_date', $currentMonth->year)
            ->whereMonth('bookings.booking_date', $currentMonth->month)
            ->sum('bookings.owner_revenue');  // ← BERSIH, setelah komisi

        // Pending bookings count
        $pendingBookingsCount = DB::table('bookings')
            ->join('courts', 'bookings.court_id', '=', 'courts.id')
            ->join('venues', 'courts.venue_id', '=', 'venues.id')
            ->where('venues.user_id', $userId)
            ->where('bookings.status', 'pending')
            ->whereNotNull('bookings.payment_proof')
            ->count();

        // Recent bookings (5 data terbaru)
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
                'bookings.admin_fee',
                'bookings.owner_revenue',
                'bookings.status',
                'bookings.created_at'
            )
            ->where('venues.user_id', $userId)
            ->orderBy('bookings.created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($booking) => [
                'id'            => $booking->id,
                'customer_name' => $booking->customer_name,
                'court_name'    => $booking->court_name,
                'booking_date'  => $booking->booking_date,
                'start_time'    => $booking->start_time,
                'end_time'      => $booking->end_time,
                'total_price'   => (int) $booking->total_price,
                'admin_fee'     => (int) $booking->admin_fee,
                'owner_revenue' => (int) $booking->owner_revenue,
                'status'        => $booking->status,
                'created_at'    => $booking->created_at,
            ]);

        // ── Data Langganan untuk Banner Notifikasi ──
        $subscriptionStatus  = $user->subscription_status;
        $subscriptionEndsAt  = $user->subscription_ends_at; // Carbon instance via cast
        $daysRemaining       = $subscriptionEndsAt ? (int) now()->diffInDays($subscriptionEndsAt, false) : null;

        $subscriptionAlert = null;
        if ($subscriptionStatus === 'inactive') {
            $subscriptionAlert = ['type' => 'danger', 'message' => 'Langganan Anda tidak aktif. Venue Anda tidak tampil di pencarian pelanggan. Hubungi Admin.'];
        } elseif ($daysRemaining !== null && $daysRemaining <= 7 && $daysRemaining >= 0) {
            $subscriptionAlert = ['type' => 'warning', 'message' => "Langganan Anda akan berakhir dalam {$daysRemaining} hari ({$subscriptionEndsAt->format('d M Y')}). Segera perpanjang!"];
        } elseif ($daysRemaining !== null && $daysRemaining < 0) {
            $subscriptionAlert = ['type' => 'danger', 'message' => 'Langganan Anda telah berakhir. Venue Anda tidak tampil di pencarian pelanggan.'];
        }

        return Inertia::render('Owner/Dashboard', [
            'statistics' => [
                'total_venues'          => $totalVenues,
                'total_courts'          => $totalCourts,
                'monthly_revenue'       => (int) $monthlyRevenue,
                'pending_bookings_count'=> $pendingBookingsCount,
            ],
            'recent_bookings'     => $recentBookings->toArray(),
            'subscription_alert'  => $subscriptionAlert,
            'subscription_ends_at'=> $subscriptionEndsAt?->toDateString(),
        ]);
    }
}
