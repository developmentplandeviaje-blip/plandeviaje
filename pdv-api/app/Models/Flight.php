<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de Vuelo.
 *
 * Representa un vuelo con destino, país, precio y características.
 * Se relaciona con un Post para el contenido multimedia.
 */
class Flight extends Model
{
    use HasFactory;

    protected $table = 'flights';
    protected $primaryKey = 'flights_ID';
    public $timestamps = false;

    protected $fillable = [
        'post_FK',
        'destination',
        'country_FK',
        'map_location',
        'features',
        'requirements',
        'starting_price',
        'isActive',
    ];

    protected $casts = [
        'features'       => 'array',
        'requirements'   => 'array',
        'starting_price' => 'decimal:2',
        'isActive'       => 'boolean',
    ];

    /** Post con el contenido multimedia del vuelo. */
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }

    /** País de destino del vuelo. */
    public function country()
    {
        return $this->belongsTo(Country::class, 'country_FK', 'country_ID');
    }
}
