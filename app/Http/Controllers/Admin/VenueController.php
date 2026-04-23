<?php

namespace App\Http\Controllers\Admin;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class VenueController extends Controller
{
    /**
     * Display a listing of the venues.
     */
    public function index()
    {
        $venues = Venue::all()
            ->map(fn ($venue) => [
                'id' => $venue->id,
                'name' => $venue->name,
                'address' => $venue->address,
                'image' => $venue->image,
            ]);

        return Inertia::render('Admin/Venues/Index', [
            'venues' => $venues,
        ]);
    }

    /**
     * Show the form for creating a new venue.
     */
    public function create()
    {
        return Inertia::render('Admin/Venues/Create');
    }

    /**
     * Store a newly created venue in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $request->file('image')->move(public_path('venues'), $imageName);
            $validated['image'] = $imageName;
        }

        Venue::create($validated);

        return redirect()->route('admin.venues.index')
            ->with('success', 'Tempat olahraga berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified venue.
     */
    public function edit(Venue $venue)
    {
        return Inertia::render('Admin/Venues/Edit', [
            'venue' => [
                'id' => $venue->id,
                'name' => $venue->name,
                'address' => $venue->address,
                'image' => $venue->image,
            ],
        ]);
    }

    /**
     * Update the specified venue in storage.
     */
    public function update(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($venue->image && file_exists(public_path('venues/' . $venue->image))) {
                unlink(public_path('venues/' . $venue->image));
            }

            $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $request->file('image')->move(public_path('venues'), $imageName);
            $validated['image'] = $imageName;
        }

        $venue->update($validated);

        return redirect()->route('admin.venues.index')
            ->with('success', 'Tempat olahraga berhasil diperbarui');
    }

    /**
     * Remove the specified venue from storage.
     */
    public function destroy(Venue $venue)
    {
        // Delete image if exists
        if ($venue->image && file_exists(public_path('venues/' . $venue->image))) {
            unlink(public_path('venues/' . $venue->image));
        }

        $venue->delete();

        return redirect()->route('admin.venues.index')
            ->with('success', 'Tempat olahraga berhasil dihapus');
    }
}
