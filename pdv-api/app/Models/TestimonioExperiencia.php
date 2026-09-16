<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestimonioExperiencia extends Model
{
    use HasFactory;

    protected $table = 'testimonios_experiencias';

    protected $fillable = [
        'atencion_calificacion',
        'atencion_representante_calificacion',
        'itinerario_calificacion',
        'calidad_calificacion',
        'experiencia_calificacion',
        'desempeno_ventas',
        'recomendacion',
        'fidelidad',
        'comentarios',
        'referencia_viaje',
    ];

    protected $casts = [
        'atencion_calificacion' => 'integer',
        'atencion_representante_calificacion' => 'integer',
        'itinerario_calificacion' => 'integer',
        'calidad_calificacion' => 'integer',
        'experiencia_calificacion' => 'integer',
        'desempeno_ventas' => 'boolean',
        'recomendacion' => 'boolean',
        'fidelidad' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
