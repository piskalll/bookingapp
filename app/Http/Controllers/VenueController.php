<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VenueController extends Controller
{
    /**
     * Display a listing of venues with their courts.
     * Menggunakan eager loading untuk performa optimal.
     */
    public function index()
    {
        $venues = Venue::with('courts')->get();

        return Inertia::render('Venues/Index', [
            'venues' => $venues,
        ]);
    }

    /**
     * Display venues data as JSON (untuk API/AJAX).
     */
    public function getVenuesWithCourts()
    {
        return response()->json([
            'venues' => Venue::with('courts')->get(),
        ]);
    }
}
