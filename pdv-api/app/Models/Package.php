<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de Paquete Turístico.
 *
 * Combina un alojamiento con un tipo de huésped, tipo de pensión,
 * duración y características para ofrecer una oferta integral.
 */
class Package extends Model
{
    use HasFactory;

    protected $table = 'packages';
    protected $primaryKey = 'packages_ID';
    public $timestamps = false;

    protected $fillable = [
        'post_FK',
        'accommodation_FK',
        'features',
        'starting_price',
        'days',
        'guest_type_FK',
        'board_type_FK',
        'isActive',
        'isFeatured',
        'end_date',
    ];

    protected $casts = [
        'features'       => 'array',
        'starting_price' => 'decimal:2',
        'isActive'       => 'boolean',
        'isFeatured'     => 'boolean',
        'end_date'       => 'datetime',
    ];

    /** Post con el contenido multimedia del paquete. */
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }

    /** Alojamiento incluido en el paquete. */
    public function accommodation()
    {
        return $this->belongsTo(Accommodation::class, 'accommodation_FK', 'accommodation_ID');
    }

    /** Tipo de huésped (pareja, familiar, individual). */
    public function guestType()
    {
        return $this->belongsTo(GuestType::class, 'guest_type_FK', 'guest_type_ID');
    }

    /** Tipo de pensión (Todo Incluido, Media Pensión, etc.). */
    public function boardType()
    {
        return $this->belongsTo(BoardType::class, 'board_type_FK', 'board_type_ID');
    }
}
