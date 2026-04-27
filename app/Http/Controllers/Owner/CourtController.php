<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Models\Court;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourtController extends Controller
{
    // Menampilkan daftar lapangan di dalam venue tertentu
    public function index(Venue $venue)
    {
        // Proteksi
        if ($venue->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Owner/Courts/Index', [
            'venue' => $venue->load('courts') // Load venue beserta data lapangan di dalamnya
        ]);
    }

    // Menampilkan form tambah lapangan
    public function create(Venue $venue)
    {
        if ($venue->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Owner/Courts/Create', [
            'venue' => $venue
        ]);
    }

    // Menyimpan lapangan baru
    public function store(Request $request, Venue $venue)
    {
        if ($venue->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:futsal,badminton,basket',
            'price_per_hour' => 'required|integer|min:0',
        ]);

        // Simpan court baru melalui relasi venue
        $venue->courts()->create($validated);

        return redirect()->route('owner.venues.courts.index', $venue->id)
            ->with('success', 'Lapangan baru berhasil ditambahkan!');
    }
}