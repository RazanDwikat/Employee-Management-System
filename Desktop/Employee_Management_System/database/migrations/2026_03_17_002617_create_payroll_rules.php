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
        Schema::create('payroll_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_name');
            $table->enum('rule_type', ['late', 'overtime', 'absence', 'leave']);
            $table->enum('calculation_type', ['per_minute', 'per_hour', 'fixed']);
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_rules');
    }
};
