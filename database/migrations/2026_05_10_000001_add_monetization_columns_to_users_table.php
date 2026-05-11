<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Hanya relevan untuk role 'owner', namun disimpan di tabel users
            $table->decimal('commission_rate', 5, 2)->default(5.00)->after('role')
                ->comment('Persentase komisi admin per transaksi (e.g. 5.00 = 5%)');
            $table->enum('subscription_status', ['active', 'inactive'])->default('inactive')->after('commission_rate');
            $table->date('subscription_ends_at')->nullable()->after('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['commission_rate', 'subscription_status', 'subscription_ends_at']);
        });
    }
};
