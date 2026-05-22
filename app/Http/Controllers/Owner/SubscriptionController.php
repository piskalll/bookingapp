<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class SubscriptionController extends Controller
{
    /**
     * Tampilkan halaman Billing & Langganan milik owner.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Owner/Subscription', [
            'subscription_status'   => $user->subscription_status,
            'subscription_ends_at'  => $user->subscription_ends_at?->format('Y-m-d'),
        ]);
    }

    /**
     * Buat transaksi baru dan kembalikan Snap Token ke frontend.
     * Harga tetap: Rp 50.000 untuk perpanjangan 30 hari.
     */
    public function pay(Request $request)
    {
        $user    = Auth::user();
        $amount  = 50000; // Rp 50.000
        $orderId = 'SUB-' . $user->id . '-' . time();

        // Simpan record pembayaran ke DB
        $payment = SubscriptionPayment::create([
            'owner_id' => $user->id,
            'order_id' => $orderId,
            'amount'   => $amount,
            'status'   => 'pending',
        ]);

        // Konfigurasi Midtrans
        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized  = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds        = config('midtrans.is_3ds');

        $nameParts = explode(' ', $user->name, 2);

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $nameParts[0],
                'last_name'  => $nameParts[1] ?? '',
                'email'      => $user->email,
            ],
            'item_details' => [
                [
                    'id'       => 'SUBSCRIPTION-30DAY',
                    'price'    => $amount,
                    'quantity' => 1,
                    'name'     => 'Perpanjangan Langganan Owner 30 Hari',
                ],
            ],
            'callbacks' => [
                'finish' => route('owner.subscription.index'),
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            // Simpan snap_token ke record
            $payment->update(['snap_token' => $snapToken]);

            return response()->json([
                'snap_token' => $snapToken,
                'order_id'   => $orderId,
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription Snap Token Error: ' . $e->getMessage(), [
                'owner_id' => $user->id,
                'order_id' => $orderId,
            ]);

            // Tandai pembayaran sebagai gagal jika token tidak bisa dibuat
            $payment->update(['status' => 'failed']);

            return response()->json([
                'message' => 'Gagal membuat sesi pembayaran. Silakan coba lagi.',
            ], 500);
        }
    }
}
