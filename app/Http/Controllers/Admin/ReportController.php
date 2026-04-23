<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

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
}


