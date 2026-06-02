<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo central de contenido.
 *
 * Actúa como tabla base para vuelos, alojamientos, paquetes y blog posts.
 * Contiene los campos compartidos: nombre, descripción, banner e imágenes.
 */
class Post extends Model
{
    use HasFactory;

    protected $table = 'posts';
    protected $primaryKey = 'post_ID';

    /**
     * IMPORTANTE: Configuración para llaves primarias personalizadas.
     */
    public $incrementing = true;
    protected $keyType = 'int';
    
    // Habilitamos timestamps para manejar created_at y updated_at automáticamente
    public $timestamps = true;

    protected $fillable = [
        'name',
        'overview',
        'information',
        'banner',
        'thumbnail',
        'createdBy',
        'updatedBy',
    ];

    protected $appends = ['formatted_date'];

    /**
     * Atributo dinámico para mostrar la fecha amigable.
     * Si el post tiene menos de 24 horas, muestra "Publicación reciente".
     */
    public function getFormattedDateAttribute()
    {
        if (!$this->created_at) {
            return null;
        }

        $date = \Carbon\Carbon::parse($this->created_at);
        $now = \Carbon\Carbon::now();

        // Diferencia absoluta en horas
        $diffHours = $date->diffInHours($now);

        if ($diffHours <= 24) {
            return "Publicación reciente";
        }

        // Formato: 01 Jun 2026 (en español)
        return $date->locale('es')->translatedFormat('d M Y');
    }

    // --- RELACIONES ---

    /** Imágenes de galería asociadas al post. */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class, 'post_FK', 'post_ID');
    }

    /** Vuelo asociado (si el post es un vuelo). */
    public function flight(): HasOne
    {
        return $this->hasOne(Flight::class, 'post_FK', 'post_ID');
    }

    /** Alojamiento asociado (si el post es un hotel). */
    public function accommodation(): HasOne
    {
        return $this->hasOne(Accommodation::class, 'post_FK', 'post_ID');
    }

    /** Paquete asociado (si el post es un paquete). */
    public function package(): HasOne
    {
        return $this->hasOne(Package::class, 'post_FK', 'post_ID');
    }

    /** Blog post asociado (si el post es una publicación). */
    public function blogPost(): HasOne
    {
        return $this->hasOne(BlogPost::class, 'post_FK', 'post_ID');
    }

    /** Consultas de clientes vinculadas a este post. */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'post_FK', 'post_ID');
    }
}