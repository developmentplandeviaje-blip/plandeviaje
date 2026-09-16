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
            $table->unsignedTinyInteger('atencion_representante_calificacion')->after('atencion_calificacion')->default(5);
            $table->boolean('desempeno_ventas')->after('experiencia_calificacion')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonios_experiencias', function (Blueprint $table) {
            $table->dropColumn(['atencion_representante_calificacion', 'desempeno_ventas']);
        });
    }
};
