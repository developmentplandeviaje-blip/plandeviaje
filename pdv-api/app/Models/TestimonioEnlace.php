<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestimonioEnlace extends Model
{
    use HasFactory;

    protected $table = 'testimonios_enlaces';

    protected $fillable = [
        'token',
        'referencia_viaje',
        'accesos_count',
        'max_usos',
    ];

    protected $casts = [
        'accesos_count' => 'integer',
        'max_usos'      => 'integer',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];
}
