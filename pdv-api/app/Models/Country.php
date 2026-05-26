<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $table = 'countries';
    protected $primaryKey = 'country_ID';
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function flights()
    {
        return $this->hasMany(Flight::class, 'country_FK', 'country_ID');
    }
}
