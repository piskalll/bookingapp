<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Support\Facades\Features;
use Inertia\Inertia;
use Laravel\Fortify\Features as FortifyFeatures;

class HomeController extends Controller
{
    /**
     * Display the landing page with featured venues.
     */
    public function index()
    {
        $featuredVenues = Venue::with('courts')
            ->whereHas('owner', function ($q) {
                $q->where('subscription_status', 'active')
                  ->where(function ($q2) {
                      $q2->whereNull('subscription_ends_at')
                         ->orWhere('subscription_ends_at', '>=', now()->toDateString());
                  });
            })
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($venue) {
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

        return Inertia::render('Welcome', [
            'canRegister'    => FortifyFeatures::enabled(FortifyFeatures::registration()),
            'featuredVenues' => $featuredVenues,
        ]);
    }
}
