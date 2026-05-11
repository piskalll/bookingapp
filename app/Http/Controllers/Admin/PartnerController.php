<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartnerController extends Controller
{
    /**
     * Tampilkan daftar semua Owner beserta data monetisasi.
     */
    public function index()
    {
        $partners = User::where('role', 'owner')
            ->with(['venues'])
            ->withCount('venues')
            ->get()
            ->map(fn($owner) => [
                'id'                   => $owner->id,
                'name'                 => $owner->name,
                'email'                => $owner->email,
                'commission_rate'      => (float) $owner->commission_rate,
                'subscription_status'  => $owner->subscription_status,
                'subscription_ends_at' => $owner->subscription_ends_at?->toDateString(),
                'venues_count'         => $owner->venues_count,
            ]);

        return Inertia::render('Admin/Partners', [
            'partners' => $partners,
        ]);
    }

    /**
     * Update commission_rate untuk Owner tertentu.
     */
    public function updateCommission(Request $request, User $user)
    {
        abort_if($user->role !== 'owner', 403, 'User bukan Owner.');

        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $user->update(['commission_rate' => $validated['commission_rate']]);

        return back()->with('success', "Komisi untuk {$user->name} berhasil diperbarui menjadi {$validated['commission_rate']}%.");
    }

    /**
     * Perpanjang / aktifkan langganan Owner.
     */
    public function renewSubscription(Request $request, User $user)
    {
        abort_if($user->role !== 'owner', 403, 'User bukan Owner.');

        $validated = $request->validate([
            'months' => 'required|integer|min:1|max:24',
        ]);

        // Jika langganan masih aktif dan belum expired, perpanjang dari tanggal berakhir
        $startFrom = ($user->subscription_ends_at && $user->subscription_ends_at > now())
            ? $user->subscription_ends_at
            : now();

        $newEndDate = $startFrom->addMonths($validated['months']);

        $user->update([
            'subscription_status'  => 'active',
            'subscription_ends_at' => $newEndDate,
        ]);

        return back()->with('success', "Langganan {$user->name} diperpanjang hingga {$newEndDate->format('d M Y')}.");
    }

    /**
     * Nonaktifkan langganan Owner (manual).
     */
    public function deactivateSubscription(User $user)
    {
        abort_if($user->role !== 'owner', 403, 'User bukan Owner.');

        $user->update([
            'subscription_status' => 'inactive',
        ]);

        return back()->with('success', "Langganan {$user->name} telah dinonaktifkan.");
    }
}
