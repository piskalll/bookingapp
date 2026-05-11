<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Venue;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Total pendapatan platform = sum admin_fee dari booking confirmed
        $totalPlatformRevenue = Booking::where('status', 'confirmed')
            ->sum('admin_fee');

        // Total transaksi (semua status kecuali cancelled)
        $totalTransactions = Booking::where('status', '!=', 'cancelled')->count();

        // Total pengguna (customer)
        $totalCustomers = User::where('role', 'customer')->count();

        // Total venue aktif (owner berlangganan)
        $totalActiveVenues = Venue::whereHas('owner', fn($q) =>
            $q->where('subscription_status', 'active')
              ->where(fn($q2) =>
                  $q2->whereNull('subscription_ends_at')
                     ->orWhere('subscription_ends_at', '>=', now())
              )
        )->count();

        // Total owner
        $totalOwners = User::where('role', 'owner')->count();

        // Pesanan menunggu konfirmasi (payment uploaded, belum di-approve)
        $pendingConfirmations = Booking::where('status', 'waiting_confirmation')->count();

        // 10 transaksi terbaru untuk tabel audit
        $recentTransactions = Booking::with('user', 'court.venue')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($b) => [
                'id'            => $b->id,
                'customer_name' => $b->user?->name,
                'venue_name'    => $b->court?->venue?->name,
                'court_name'    => $b->court?->name,
                'booking_date'  => $b->booking_date,
                'total_price'   => $b->total_price,
                'admin_fee'     => $b->admin_fee,
                'owner_revenue' => $b->owner_revenue,
                'status'        => $b->status,
                'created_at'    => $b->created_at,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'statistics' => [
                'total_platform_revenue' => (int) $totalPlatformRevenue,
                'total_transactions'     => $totalTransactions,
                'total_customers'        => $totalCustomers,
                'total_active_venues'    => $totalActiveVenues,
                'total_owners'           => $totalOwners,
                'pending_confirmations'  => $pendingConfirmations,
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
