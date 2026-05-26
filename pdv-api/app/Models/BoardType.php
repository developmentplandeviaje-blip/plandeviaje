<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoardType extends Model
{
    use HasFactory;

    protected $table = 'board_types';
    protected $primaryKey = 'board_type_ID';
    
    // Configuración para llave primaria personalizada
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'type',
    ];

    /**
     * Relación con alojamientos.
     */
    public function accommodation(): HasMany
    {
        return $this->hasMany(Accommodation::class, 'board_type_FK', 'board_type_ID');
    }

    /**
     * Relación con paquetes.
     */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'board_type_FK', 'board_type_ID');
    }
}