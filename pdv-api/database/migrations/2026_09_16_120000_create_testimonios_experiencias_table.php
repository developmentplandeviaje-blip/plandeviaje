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
        Schema::create('testimonios_experiencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('atencion_calificacion');
            $table->unsignedTinyInteger('itinerario_calificacion');
            $table->unsignedTinyInteger('calidad_calificacion');
            $table->unsignedTinyInteger('experiencia_calificacion');
            $table->boolean('recomendacion');
            $table->boolean('fidelidad');
            $table->text('comentarios')->nullable();
            $table->string('referencia_viaje')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonios_experiencias');
    }
};
