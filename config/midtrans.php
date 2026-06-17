<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk integrasi Midtrans Payment Gateway.
    | Daftarkan akun di https://dashboard.midtrans.com
    |
    */

    'server_key'    => env('MIDTRANS_SERVER_KEY', 'Mid-server-qUOhJPSpG7SbvSJibrzKnjqi'),
    'client_key'    => env('MIDTRANS_CLIENT_KEY', 'Mid-client-q6UIB0J4SbLxSIF1'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    | Sanitize artinya Midtrans akan membersihkan karakter
    | yang tidak diperbolehkan pada nilai parameter transaksi.
    */
    'is_sanitized'  => true,

    /*
    | Aktifkan 3DS (3D Secure) untuk kartu kredit
    */
    'is_3ds'        => true,
];
