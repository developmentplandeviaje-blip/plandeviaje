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
        Schema::create('testimonios_enlaces', function (Blueprint $table) {
            $table->id();
            $table->string('token')->unique();
            $table->string('referencia_viaje')->nullable();
            $table->integer('accesos_count')->default(0);
            $table->integer('max_usos')->default(3);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonios_enlaces');
    }
};
