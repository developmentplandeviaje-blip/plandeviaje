<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalidadVigencia extends Model
{
    use HasFactory;

    protected $table = 'legalidad_vigencia';

    protected $fillable = [
        'token',
        'titulo',
        'texto',
        'url_video',
    ];

    /**
     * Imágenes asociadas al carrusel ordenadas según el campo 'orden'.
     */
    public function imagenes()
    {
        return $this->hasMany(LegalidadImagen::class, 'legalidad_id')->orderBy('orden', 'asc');
    }
}
