<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VenueController extends Controller
{
    /**
     * Tampilkan Venue milik owner yang sedang login.
     */
    public function index()
    {
        $venues = Venue::where('user_id', auth()->id())
            ->withCount('courts')
            ->latest()
            ->get();

        return Inertia::render('Owner/Venues/Index', [
            'venues' => $venues,
        ]);
    }

    /**
     * Tampilkan form edit Venue.
     * Pastikan venue ini milik owner yang sedang login.
     */
    public function edit(Venue $venue)
    {
        if ($venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Owner/Venues/Edit', [
            'venue' => $venue,
        ]);
    }

    /**
     * Update data Venue.
     */
    public function update(Request $request, Venue $venue)
    {
        if ($venue->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama
            if ($venue->image && file_exists(public_path('uploads/venues/' . $venue->image))) {
                @unlink(public_path('uploads/venues/' . $venue->image));
            }
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/venues'), $filename);
            $validated['image'] = $filename;
        }

        $venue->update($validated);

        return redirect()->route('owner.venues.index')->with('success', 'Informasi tempat berhasil diperbarui.');
    }
}