<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RoomType extends Model
{
    use HasFactory;
    
    protected $table = 'room_types';
    protected $primaryKey = 'room_type_ID';
    
    // Configuración para llave primaria personalizada
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;
    
    protected $fillable = ['type'];

    /**
     * Relación muchos a muchos con alojamientos.
     */
    public function accommodations(): BelongsToMany
    {
        return $this->belongsToMany(
            Accommodation::class, 
            'accommodation_room_type', 
            'room_type_ID', 
            'accommodation_ID'
        );
    }
}