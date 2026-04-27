<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Venue;   

class VenueController extends Controller
{
    public function index()
    {
        $venues = auth()->user()->venues()->with('courts')->get();
        return Inertia::render('Owner/Venues/Index', [
            'venues' => $venues
        ]);
    }

    // Menampilkan form tambah tempat
    public function create()
    {
        return Inertia::render('Owner/Venues/Create');
    }

    // Menyimpan data tempat baru ke database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Maksimal 2MB
        ]);

        // Proses upload gambar jika ada
        if ($request->hasFile('image')) {
            $imageName = time() . '_' . $request->file('image')->getClientOriginalName();
            // Simpan ke folder yang sudah kita sepakati sebelumnya
            $request->file('image')->move(public_path('uploads/venues'), $imageName);
            $validated['image'] = $imageName;
        }

        // Simpan data venue baru yang otomatis terikat dengan owner yang sedang login
        auth()->user()->venues()->create($validated);

        return redirect()->route('owner.venues.index')->with('success', 'Tempat olahraga berhasil ditambahkan!');
    }

    public function edit(Venue $venue)
    {
        // Proteksi: Pastikan owner hanya bisa edit miliknya sendiri
        if ($venue->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Owner/Venues/Edit', [
            'venue' => $venue
        ]);
    }

    public function update(Request $request, Venue $venue)
    {
        if ($venue->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Hapus 'image' dari array $validated agar tidak di-update menjadi NULL 
        // jika user tidak memilih foto baru.
        unset($validated['image']);

        if ($request->hasFile('image')) {
            // Hapus foto lama jika ada di server
            if ($venue->image && file_exists(public_path('uploads/venues/' . $venue->image))) {
                unlink(public_path('uploads/venues/' . $venue->image));
            }

            $imageName = time() . '_' . $request->file('image')->getClientOriginalName();
            $request->file('image')->move(public_path('uploads/venues'), $imageName);
            
            // Masukkan kembali nama file baru ke dalam array $validated
            $validated['image'] = $imageName;
        }

        // Sekarang, jika tidak ada file baru, array $validated hanya berisi name dan address
        $venue->update($validated);

        return redirect()->route('owner.venues.index')->with('success', 'Data tempat berhasil diperbarui!');
    }
}