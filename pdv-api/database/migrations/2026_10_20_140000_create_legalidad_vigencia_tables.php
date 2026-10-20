<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('legalidad_vigencia', function (Blueprint $table) {
            $table->id();
            $table->string('token', 100)->unique();
            $table->string('titulo', 255);
            $table->longText('texto')->nullable();
            $table->text('url_video')->nullable();
            $table->timestamps();
        });

        Schema::create('legalidad_imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('legalidad_id')->constrained('legalidad_vigencia')->onDelete('cascade');
            $table->string('ruta_imagen', 500);
            $table->integer('orden')->default(0);
            $table->timestamps();
        });

        // Insert initial default record matching the design sketch
        $defaultToken = 'somos-plan-de-viaje-' . strtolower(Str::random(6));
        $defaultTexto = "Plan de Viaje Nació en la isla de Margarita, con el firme propósito de impulsar sus lugares más asombrosos, hoteles confortables y playas increíbles que lo convierte en el destino turístico principal de los venezolanos, sin dejar a un lado otros increíbles destinos del país.\n\nNuestra agencia de Viaje se ha encargado por más de 10 años en planificar y crear experiencias para el disfrute de nuestros viajeros a través de servicios de traslados, paquetería turística, boletería aérea y de ferry.";

        DB::table('legalidad_vigencia')->insert([
            'token'      => $defaultToken,
            'titulo'     => '¡SOMOS PLAN DE VIAJE, MÁS QUE VIAJAR!',
            'texto'      => $defaultTexto,
            'url_video'  => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legalidad_imagenes');
        Schema::dropIfExists('legalidad_vigencia');
    }
};
