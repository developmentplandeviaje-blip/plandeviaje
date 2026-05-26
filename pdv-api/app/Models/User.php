<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 1;
    public const ROLE_EDITOR = 2;
    public const ROLE_MANAGER = 3;

    // 1. Configuración de Llave Primaria personalizada
    protected $primaryKey = 'user_ID';
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * IMPORTANTE: Indica a Sanctum/Auth que el ID se llama user_ID.
     * Esto resuelve el error al intentar insertar en personal_access_tokens.
     */
    public function getAuthIdentifierName()
    {
        return 'user_ID';
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'integer',
        ];
    }

    // Helpers de Roles
    public function isAdmin(): bool { return (int)$this->role === self::ROLE_ADMIN; }
    public function isEditor(): bool { return (int)$this->role === self::ROLE_EDITOR; }
    public function isManager(): bool { return (int)$this->role === self::ROLE_MANAGER; }
}