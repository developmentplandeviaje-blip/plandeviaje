<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    use HasFactory;

    protected $table = 'accommodation';
    protected $primaryKey = 'accommodation_ID';
    
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'post_FK',
        'destination',
        'map_location',
        'starting_price',
        'stars',
        'board_type_FK',
        'guest_type_FK', // <-- IMPORTANTE: Faltaba este para los tipos de huéspedes
        'features',
        'isActive',
    ];

    protected $casts = [
        'features'       => 'array',
        'starting_price' => 'decimal:2',
        'isActive'       => 'boolean',
        'stars'          => 'integer',
    ];

    /** Relación con el Post (Contenido base) */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }

    /** Relación con el tipo de pensión */
    public function boardType(): BelongsTo
    {
        return $this->belongsTo(BoardType::class, 'board_type_FK', 'board_type_ID');
    }

    /** Relación con el tipo de huésped (Añadida para consistencia) */
    public function guestType(): BelongsTo
    {
        return $this->belongsTo(GuestType::class, 'guest_type_FK', 'guest_type_ID');
    }

    /** Relación con los paquetes turísticos */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'accommodation_FK', 'accommodation_ID');
    }

    /** Relación muchos a muchos con Tipos de Habitación */
    public function roomTypes(): BelongsToMany
    {
        return $this->belongsToMany(
            RoomType::class, 
            'accommodation_room_type', 
            'accommodation_ID', 
            'room_type_ID'
        );
    }
}