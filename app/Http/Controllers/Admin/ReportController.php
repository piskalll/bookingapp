<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Export bookings report to PDF
     * Filter by date range and status='confirmed'
     */
    public function exportPdf(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Get bookings data
        $bookings = Booking::with('user', 'court', 'court.venue')
            ->where('status', 'confirmed')
            ->whereDate('booking_date', '>=', $validated['start_date'])
            ->whereDate('booking_date', '<=', $validated['end_date'])
            ->orderBy('booking_date', 'asc')
            ->get()
            ->map(function ($booking) {
                return [
                    'booking_date' => $booking->booking_date,
                    'user_name' => $booking->user->name,
                    'court_name' => $booking->court->name,
                    'venue_name' => $booking->court->venue->name,
                    'total_price' => $booking->total_price,
                ];
            });

        // Calculate total revenue
        $totalRevenue = $bookings->sum('total_price');

        // Prepare data for PDF
        $data = [
            'bookings' => $bookings,
            'totalRevenue' => $totalRevenue,
            'startDate' => $validated['start_date'],
            'endDate' => $validated['end_date'],
            'printDate' => now()->format('d-m-Y H:i'),
        ];

        // Generate PDF using global PDF helper or Pdf class
        $pdf = \PDF::loadView('reports.pdf', $data);
        $fileName = 'Laporan-Pendapatan-' . date('d-m-Y') . '.pdf';

        return $pdf->download($fileName);
    }

    /* ------------------------------------------------------------------ */
    /* Laporan Keuangan Langganan Mitra                                      */
    /* ------------------------------------------------------------------ */

    /**
     * Tampilkan halaman laporan keuangan langganan.
     */
    public function subscriptionReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->input('end_date',   now()->toDateString());
        $status    = $request->input('status', '');

        // ── Query pembayaran langganan ──
        $query = SubscriptionPayment::with('owner')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        if ($status !== '') {
            $query->where('status', $status);
        }

        $rawPayments = $query->orderByDesc('created_at')->get();

        // ── Map ke format frontend ──
        $payments = $rawPayments->map(fn($p) => [
            'id'          => $p->id,
            'owner_id'    => $p->owner_id,
            'owner_name'  => $p->owner?->name ?? '—',
            'owner_email' => $p->owner?->email ?? '—',
            'order_id'    => $p->order_id,
            'amount'      => (int) $p->amount,
            'months'      => $this->extractMonths($p->order_id),
            'status'      => $p->status,
            'created_at'  => $p->created_at?->toIso8601String(),
        ]);

        // ── Stats ──
        $successPayments = $rawPayments->where('status', 'success');
        $stats = [
            'totalRevenue'       => (int) $successPayments->sum('amount'),
            'totalTransactions'  => $successPayments->count(),
            'totalPartners'      => $rawPayments->pluck('owner_id')->unique()->count(),
            'successRevenue'     => (int) $successPayments->sum('amount'),
            'pendingRevenue'     => (int) $rawPayments->where('status', 'pending')->sum('amount'),
        ];

        // ── Monthly breakdown ──
        $monthlyData = $rawPayments
            ->where('status', 'success')
            ->groupBy(fn($p) => $p->created_at->format('Y-m'))
            ->map(fn($group, $month) => [
                'month' => $month,
                'label' => \Carbon\Carbon::parse($month . '-01')->translatedFormat('M Y'),
                'total' => (int) $group->sum('amount'),
                'count' => $group->count(),
            ])
            ->sortKeys()
            ->values();

        // ── Partner summary ──
        $partnerSummary = User::where('role', 'owner')
            ->withCount(['venues'])
            ->get()
            ->map(function ($owner) use ($rawPayments) {
                $ownerPayments = $rawPayments->where('owner_id', $owner->id)->where('status', 'success');
                return [
                    'id'                   => $owner->id,
                    'name'                 => $owner->name,
                    'email'                => $owner->email,
                    'transaction_count'    => $ownerPayments->count(),
                    'total_paid'           => (int) $ownerPayments->sum('amount'),
                    'subscription_status'  => $owner->subscription_status,
                    'subscription_ends_at' => $owner->subscription_ends_at?->toDateString(),
                ];
            })
            ->filter(fn($ps) => $ps['total_paid'] > 0)
            ->sortByDesc('total_paid')
            ->values();

        $statusLabel = match ($status) {
            'success' => 'Berhasil',
            'pending' => 'Pending',
            'failed'  => 'Gagal',
            default   => 'Semua Status',
        };

        return Inertia::render('Admin/SubscriptionReport', [
            'payments'       => $payments,
            'partnerSummary' => $partnerSummary,
            'monthlyData'    => $monthlyData,
            'stats'          => $stats,
            'filters'        => [
                'start_date' => $startDate,
                'end_date'   => $endDate,
                'status'     => $status,
            ],
        ]);
    }

    /**
     * Export laporan langganan ke PDF.
     */
    public function exportSubscriptionPdf(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->input('end_date',   now()->toDateString());
        $status    = $request->input('status', '');

        $query = SubscriptionPayment::with('owner')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        if ($status !== '') {
            $query->where('status', $status);
        }

        $rawPayments = $query->orderByDesc('created_at')->get();

        $payments = $rawPayments->map(fn($p) => [
            'id'          => $p->id,
            'owner_name'  => $p->owner?->name ?? '—',
            'owner_email' => $p->owner?->email ?? '—',
            'order_id'    => $p->order_id,
            'amount'      => (int) $p->amount,
            'months'      => $this->extractMonths($p->order_id),
            'status'      => $p->status,
            'created_at'  => $p->created_at?->toDateTimeString(),
        ]);

        $successPayments = $rawPayments->where('status', 'success');
        $totalRevenue    = (int) $successPayments->sum('amount');

        // Partner summary
        $partnerSummary = User::where('role', 'owner')->get()
            ->map(function ($owner) use ($rawPayments) {
                $ownerPayments = $rawPayments->where('owner_id', $owner->id)->where('status', 'success');
                return [
                    'name'                 => $owner->name,
                    'email'                => $owner->email,
                    'transaction_count'    => $ownerPayments->count(),
                    'total_paid'           => (int) $ownerPayments->sum('amount'),
                    'subscription_status'  => $owner->subscription_status,
                    'subscription_ends_at' => $owner->subscription_ends_at?->toDateString(),
                ];
            })
            ->filter(fn($ps) => $ps['total_paid'] > 0)
            ->sortByDesc('total_paid')
            ->values();

        $statusLabel = match ($status) {
            'success' => 'Berhasil',
            'pending' => 'Pending',
            'failed'  => 'Gagal',
            default   => 'Semua Status',
        };

        $pdf = \PDF::loadView('reports.subscription-pdf', [
            'payments'          => $payments,
            'partnerSummary'    => $partnerSummary,
            'totalRevenue'      => $totalRevenue,
            'totalTransactions' => $successPayments->count(),
            'totalPartners'     => $rawPayments->pluck('owner_id')->unique()->count(),
            'startDate'         => $startDate,
            'endDate'           => $endDate,
            'printDate'         => now()->format('d-m-Y H:i'),
            'statusLabel'       => $statusLabel,
        ])->setPaper('a4', 'portrait');

        $fileName = 'Laporan-Langganan-' . date('d-m-Y') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Ekstrak jumlah bulan dari order_id (format: SUB-{ownerID}-{months}M-{timestamp}).
     */
    private function extractMonths(string $orderId): ?int
    {
        if (preg_match('/-(\d+)M-/', $orderId, $m)) {
            return (int) $m[1];
        }
        return null;
    }
}
