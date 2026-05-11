<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Pemecahan total_price menjadi bagian admin dan owner
            $table->unsignedInteger('admin_fee')->default(0)->after('total_price')
                ->comment('Potongan komisi admin = (total_price * commission_rate) / 100');
            $table->unsignedInteger('owner_revenue')->default(0)->after('admin_fee')
                ->comment('Pendapatan bersih owner = total_price - admin_fee');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['admin_fee', 'owner_revenue']);
        });
    }
};
