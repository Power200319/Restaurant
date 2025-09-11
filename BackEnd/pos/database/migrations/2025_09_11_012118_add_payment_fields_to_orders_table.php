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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('status');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('transaction_id')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('transaction_id');
            $table->json('payment_data')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_method', 'transaction_id', 'paid_at', 'payment_data']);
        });
    }
};
