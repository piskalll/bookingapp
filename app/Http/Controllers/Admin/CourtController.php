<?php

namespace App\Http\Controllers\Admin;

use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class CourtController extends Controller
{
    /**
     * Display a listing of the courts.
     */
    public function index()
    {
        $courts = Court::with('venue')
            ->get()
            ->map(fn ($court) => [
                'id' => $court->id,
                'name' => $court->name,
                'type' => $court->type,
                'price_per_hour' => $court->price_per_hour,
                'venue_id' => $court->venue_id,
                'venue_name' => $court->venue->name,
            ]);

        return Inertia::render('Admin/Courts/Index', [
            'courts' => $courts,
        ]);
    }

    /**
     * Show the form for creating a new court.
     */
    public function create()
    {
        $venues = Venue::all()
            ->map(fn ($venue) => [
                'id' => $venue->id,
                'name' => $venue->name,
            ])
            ->values()
            ->toArray();

        return Inertia::render('Admin/Courts/Create', [
            'venues' => $venues,
        ]);
    }

    /**
     * Store a newly created court in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:futsal,badminton,basket',
            'price_per_hour' => 'required|integer|min:1',
        ]);

        Court::create($validated);

        return redirect()->route('admin.courts.index')
            ->with('success', 'Lapangan berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified court.
     */
    public function edit(Court $court)
    {
        $venues = Venue::all()
            ->map(fn ($venue) => [
                'id' => $venue->id,
                'name' => $venue->name,
            ])
            ->values()
            ->toArray();

        return Inertia::render('Admin/Courts/Edit', [
            'court' => [
                'id' => $court->id,
                'name' => $court->name,
                'type' => $court->type,
                'price_per_hour' => $court->price_per_hour,
                'venue_id' => $court->venue_id,
            ],
            'venues' => $venues,
        ]);
    }

    /**
     * Update the specified court in storage.
     */
    public function update(Request $request, Court $court)
    {
        $validated = $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:futsal,badminton,basket',
            'price_per_hour' => 'required|integer|min:1',
        ]);

        $court->update($validated);

        return redirect()->route('admin.courts.index')
            ->with('success', 'Lapangan berhasil diperbarui');
    }

    /**
     * Remove the specified court from storage.
     */
    public function destroy(Court $court)
    {
        $court->delete();

        return redirect()->route('admin.courts.index')
            ->with('success', 'Lapangan berhasil dihapus');
    }
}
