<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalidadImagen extends Model
{
    use HasFactory;

    protected $table = 'legalidad_imagenes';

    protected $fillable = [
        'legalidad_id',
        'ruta_imagen',
        'orden',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    public function legalidad()
    {
        return $this->belongsTo(LegalidadVigencia::class, 'legalidad_id');
    }
}
