<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuestType extends Model
{
    use HasFactory;

    protected $table = 'guest_types';
    protected $primaryKey = 'guest_type_ID';

    // Configuración para que Laravel maneje el ID correctamente
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'type',
    ];

    /**
     * Paquetes asociados a este tipo de huésped.
     */
    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'guest_type_FK', 'guest_type_ID');
    }

    /**
     * Consultas asociadas a este tipo de huésped.
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'guest_type_FK', 'guest_type_ID');
    }
}