<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultant extends Model
{
    protected $fillable = [
        'name',
        'img',
        'phone',
    ];

    public function inquiries()
    {
        return $this->hasMany(Inquiry::class, 'consultant_id', 'id');
    }
}
