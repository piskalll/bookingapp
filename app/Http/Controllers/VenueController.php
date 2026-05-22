<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VenueController extends Controller
{
    /**
     * Query scope: hanya venue yang ownernya berlangganan aktif
     * dan subscription belum expired.
     */
    private function activeVenueQuery()
    {
        return Venue::with('courts')
            ->whereHas('owner', function ($q) {
                $q->where('subscription_status', 'active')
                  ->where(function ($q2) {
                      $q2->whereNull('subscription_ends_at')
                         ->orWhere('subscription_ends_at', '>=', now()->toDateString());
                  });
            });
    }

    /**
     * Display a listing of venues (Customer-facing).
     * Hanya tampilkan venue dari owner yang langganannya aktif.
     */
    public function index(Request $request)
    {
        $venues = $this->activeVenueQuery()
            ->latest()
            ->paginate(9)
            ->through(function ($venue) {
                return [
                    'id'        => $venue->id,
                    'name'      => $venue->name,
                    'address'   => $venue->address,
                    'image'     => $venue->image,
                    'min_price' => $venue->courts->min('price_per_hour') ?? 0,
                    'courts'    => $venue->courts->map(fn($c) => [
                        'id'             => $c->id,
                        'name'           => $c->name,
                        'type'           => $c->type,
                        'price_per_hour' => $c->price_per_hour,
                    ]),
                ];
            });

        return Inertia::render('Venues/Index', [
            'venues' => $venues,
        ]);
    }

    /**
     * Display the specified venue with its courts.
     * Pastikan venue yang dicari juga dimiliki owner aktif.
     */
    public function show(Venue $venue)
    {
        // Cek apakah owner masih aktif; kalau tidak, 404
        $owner = $venue->owner;
        if (
            ! $owner ||
            $owner->subscription_status !== 'active' ||
            ($owner->subscription_ends_at && $owner->subscription_ends_at < now())
        ) {
            abort(404, 'Venue tidak tersedia.');
        }

        $venue->load('courts');

        return Inertia::render('Venues/Show', [
            'venue' => $venue,
        ]);
    }

    /**
     * Display venues data as JSON (untuk API/AJAX).
     */
    public function getVenuesWithCourts()
    {
        return response()->json([
            'venues' => $this->activeVenueQuery()->get(),
        ]);
    }
}
