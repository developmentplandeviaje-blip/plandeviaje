<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasDynamicImageFields;

class Consultant extends Model
{
    use HasDynamicImageFields;

    protected $fillable = [
        'id',
        'name',
        'img',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getImgAttribute($value)
    {
        return $this->formatImageUrl($value);
    }

    public function setImgAttribute($value)
    {
        $this->attributes['img'] = $this->extractImageFilename($value);
    }

    public function inquiries()
    {
        return $this->hasMany(Inquiry::class, 'consultant_id', 'id');
    }
}
