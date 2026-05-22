<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config as MidtransConfig;
use Midtrans\Notification;

class MidtransController extends Controller
{
    /**
     * Handle Midtrans payment notification/callback (Webhook).
     *
     * Route: POST /api/midtrans/callback
     * Route ini harus di-exclude dari CSRF verification.
     */
    public function notificationHandler(Request $request)
    {
        // Konfigurasi Midtrans
        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized  = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds        = config('midtrans.is_3ds');

        try {
            // Parse notifikasi dari Midtrans
            try {
                // Constructor ini melakukan verifikasi status ke server Midtrans.
                // Jika ID transaksi dummy (dari tombol Test Dashboard) tidak ada, akan throw 404.
                $notification = new Notification();
            } catch (\Exception $e) {
                Log::warning('Midtrans Notification Parsing Error (Dashboard Test?): ' . $e->getMessage());
                return response()->json([
                    'message' => 'Notification received. Parsing failed (Transaction not found on Midtrans). This is expected for Dashboard Test buttons.',
                    'error'   => $e->getMessage(),
                ], 200);
            }

            $orderId           = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus       = $notification->fraud_status;
            $paymentType       = $notification->payment_type;

            Log::info('Midtrans Notification Received', [
                'order_id'           => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status'       => $fraudStatus,
                'payment_type'       => $paymentType,
            ]);

            // ── Verifikasi Signature Key ──
            $serverKey         = config('midtrans.server_key');
            $statusCode        = $notification->status_code;
            $grossAmount       = $notification->gross_amount;
            $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            if ($notification->signature_key !== $expectedSignature) {
                Log::warning('Midtrans: Invalid signature key', ['order_id' => $orderId]);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            // ── Routing berdasarkan prefix order_id ──
            if (str_starts_with($orderId, 'SUB-')) {
                return $this->handleSubscriptionPayment($orderId, $transactionStatus, $fraudStatus);
            }

            if (str_starts_with($orderId, 'BOOK-')) {
                return $this->handleBookingPayment($orderId, $transactionStatus, $fraudStatus);
            }

            Log::error('Midtrans: Unknown order_id prefix', ['order_id' => $orderId]);
            return response()->json(['message' => 'Unknown order_id format'], 422);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Handler Error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Proses notifikasi untuk pembayaran langganan (prefix: SUB-).
     */
    private function handleSubscriptionPayment(string $orderId, string $transactionStatus, ?string $fraudStatus)
    {
        $payment = SubscriptionPayment::where('order_id', $orderId)->first();

        if (!$payment) {
            Log::error('Midtrans: SubscriptionPayment not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'Subscription payment not found'], 404);
        }

        $isSettled = $transactionStatus === 'settlement'
            || ($transactionStatus === 'capture' && $fraudStatus === 'accept');

        if ($isSettled) {
            // Update status transaksi menjadi success
            $payment->update(['status' => 'success']);

            // Perpanjang langganan owner di tabel users
            $owner = $payment->owner;

            $owner->subscription_status   = 'active';
            $owner->subscription_ends_at  = Carbon::parse($owner->subscription_ends_at ?? now())
                ->addDays(30);
            $owner->save();

            Log::info('Subscription renewed', [
                'owner_id'             => $owner->id,
                'new_subscription_end' => $owner->subscription_ends_at,
            ]);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $payment->update(['status' => 'failed']);
            Log::info('Subscription payment failed/cancelled', ['order_id' => $orderId]);
        } elseif ($transactionStatus === 'pending') {
            // Status tetap pending, tidak perlu update
            Log::info('Subscription payment still pending', ['order_id' => $orderId]);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Proses notifikasi untuk pembayaran booking lapangan (prefix: BOOK-).
     */
    private function handleBookingPayment(string $orderId, string $transactionStatus, ?string $fraudStatus)
    {
        // Format order_id: BOOK-{bookingId}-{timestamp}
        $parts     = explode('-', $orderId);
        $bookingId = $parts[1] ?? null;

        if (!$bookingId) {
            Log::error('Midtrans: Cannot parse booking_id from order_id', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid order_id format'], 422);
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            Log::error('Midtrans: Booking not found', ['booking_id' => $bookingId]);
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // ── Update Status Booking ──
        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'challenge') {
                $booking->update(['status' => 'pending']);
            } elseif ($fraudStatus === 'accept') {
                $this->confirmBooking($booking);
            }
        } elseif ($transactionStatus === 'settlement') {
            $this->confirmBooking($booking);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $booking->update(['status' => 'cancelled']);
        } elseif ($transactionStatus === 'pending') {
            $booking->update(['status' => 'pending']);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Set booking status ke confirmed dan generate booking_code unik jika belum ada.
     */
    private function confirmBooking(Booking $booking): void
    {
        $updates = ['status' => 'confirmed'];

        if (empty($booking->booking_code)) {
            $updates['booking_code'] = Booking::generateBookingCode($booking->id);
        }

        $booking->update($updates);

        Log::info('Booking confirmed with code', [
            'booking_id'   => $booking->id,
            'booking_code' => $booking->booking_code ?? $updates['booking_code'],
        ]);
    }
}
