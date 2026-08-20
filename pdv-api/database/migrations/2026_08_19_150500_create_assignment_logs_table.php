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
        Schema::create('assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inquiry_id')->nullable()->constrained('inquiries', 'inquiries_ID')->onDelete('set null');
            $table->foreignId('consultant_id')->constrained('consultants')->onDelete('cascade');
            $table->string('client_name')->nullable();
            $table->string('status'); // 'aceptada' o 'rechazada'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_logs');
    }
};
