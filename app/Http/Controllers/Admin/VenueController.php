<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Venue::with('owner')->latest();
        
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $venues = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Venues/Index', [
            'venues' => $venues,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $owners = User::where('role', 'owner')->get(['id', 'name', 'subscription_status']);
        
        return Inertia::render('Admin/Venues/Create', [
            'owners' => $owners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/venues'), $filename);
            $validated['image'] = $filename;
        }

        Venue::create($validated);

        return redirect()->route('admin.venues.index')->with('success', 'Venue berhasil ditambahkan.');
    }

    public function edit(Venue $venue)
    {
        $owners = User::where('role', 'owner')->get(['id', 'name', 'subscription_status']);
        
        return Inertia::render('Admin/Venues/Edit', [
            'venue' => $venue,
            'owners' => $owners,
        ]);
    }

    public function update(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($venue->image && file_exists(public_path('uploads/venues/' . $venue->image))) {
                @unlink(public_path('uploads/venues/' . $venue->image));
            }
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/venues'), $filename);
            $validated['image'] = $filename;
        }

        $venue->update($validated);

        return redirect()->route('admin.venues.index')->with('success', 'Venue berhasil diperbarui.');
    }

    public function destroy(Venue $venue)
    {
        if ($venue->image && file_exists(public_path('uploads/venues/' . $venue->image))) {
            @unlink(public_path('uploads/venues/' . $venue->image));
        }
        $venue->delete();

        return redirect()->route('admin.venues.index')->with('success', 'Venue berhasil dihapus.');
    }
}
