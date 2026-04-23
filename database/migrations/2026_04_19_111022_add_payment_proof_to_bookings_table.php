<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Add payment_proof column untuk menyimpan path file bukti pembayaran
            $table->string('payment_proof')->nullable()->after('total_price');
            
            // Change status enum untuk menambahkan 'waiting_confirmation'
            $table->string('status')->change();
            $table->string('status')->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('payment_proof');
        });
    }
};
