<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan kolom snap_token untuk menyimpan token transaksi Midtrans.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Token Midtrans Snap untuk membuka payment popup di frontend
            $table->string('snap_token')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('snap_token');
        });
    }
};
