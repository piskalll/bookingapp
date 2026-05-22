<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan kolom booking_code ke tabel bookings.
     * Kode unik ini di-generate otomatis saat booking dikonfirmasi (status = confirmed).
     * Format: SPB-YYYYMMDD-XXXX (contoh: SPB-20260518-0023)
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_code', 30)->nullable()->unique()->after('snap_token')
                ->comment('Kode struk unik, di-generate saat status confirmed');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('booking_code');
        });
    }
};
