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
        Schema::table('testimonios_experiencias', function (Blueprint $table) {
            $table->unsignedTinyInteger('calidad_calificacion')->nullable()->change();
            $table->unsignedTinyInteger('atencion_representante_calificacion')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonios_experiencias', function (Blueprint $table) {
            $table->unsignedTinyInteger('calidad_calificacion')->nullable(false)->change();
            $table->unsignedTinyInteger('atencion_representante_calificacion')->nullable(false)->change();
        });
    }
};
