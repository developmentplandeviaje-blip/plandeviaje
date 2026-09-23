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
        Schema::table('testimonios_enlaces', function (Blueprint $table) {
            $table->string('asesor')->nullable()->after('referencia_viaje');
        });

        Schema::table('testimonios_experiencias', function (Blueprint $table) {
            $table->string('asesor')->nullable()->after('referencia_viaje');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonios_enlaces', function (Blueprint $table) {
            $table->dropColumn('asesor');
        });

        Schema::table('testimonios_experiencias', function (Blueprint $table) {
            $table->dropColumn('asesor');
        });
    }
};
