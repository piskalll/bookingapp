<?php

use App\Http\Controllers\MidtransController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Midtrans Webhook / Callback
|--------------------------------------------------------------------------
|
| Route ini menerima notifikasi POST dari server Midtrans setiap kali
| status transaksi berubah. Route ini sengaja berada di api.php dan
| di-exclude dari CSRF middleware (lihat bootstrap/app.php).
|
*/
Route::post('/midtrans/callback', [MidtransController::class, 'notificationHandler'])
    ->name('midtrans.callback');
