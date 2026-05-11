<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourtController extends Controller
{
    /**
     * Tampilkan daftar Court milik owner.
     */
    public function index()
    {
        $courts = Court::with('venue')
            ->whereHas('venue', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->latest()
            ->get();

        return Inertia::render('Owner/Courts/Index', [
            'courts' => $courts,
        ]);
    }

    /**
     * Tampilkan form create Court.
     */
    public function create()
    {
        // Hanya venue milik owner yang ditampilkan
        $venues = Venue::where('user_id', auth()->id())->get(['id', 'name']);

        return Inertia::render('Owner/Courts/Create', [
            'venues' => $venues,
        ]);
    }

    /**
     * Simpan Court baru.
     */
    public function store(Request $request)
    {
        // Validasi dasar
        $validated = $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'price_per_hour' => 'required|integer|min:0',
        ]);

        // Authorization: Pastikan venue yang dipilih adalah milik owner
        $venue = Venue::findOrFail($validated['venue_id']);
        if ($venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        Court::create($validated);

        return redirect()->route('owner.courts.index')->with('success', 'Lapangan berhasil ditambahkan.');
    }

    /**
     * Tampilkan form edit Court.
     */
    public function edit(Court $court)
    {
        // Pastikan court ini ada di venue milik owner
        $court->load('venue');
        if ($court->venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $venues = Venue::where('user_id', auth()->id())->get(['id', 'name']);

        return Inertia::render('Owner/Courts/Edit', [
            'court' => $court,
            'venues' => $venues,
        ]);
    }

    /**
     * Update data Court.
     */
    public function update(Request $request, Court $court)
    {
        $court->load('venue');
        if ($court->venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'venue_id' => 'required|exists:venues,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'price_per_hour' => 'required|integer|min:0',
        ]);

        // Cek kembali venue tujuan (jika diubah) apakah milik owner
        $newVenue = Venue::findOrFail($validated['venue_id']);
        if ($newVenue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $court->update($validated);

        return redirect()->route('owner.courts.index')->with('success', 'Lapangan berhasil diperbarui.');
    }

    /**
     * Hapus Court.
     */
    public function destroy(Court $court)
    {
        $court->load('venue');
        if ($court->venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $court->delete();

        return redirect()->route('owner.courts.index')->with('success', 'Lapangan berhasil dihapus.');
    }
}