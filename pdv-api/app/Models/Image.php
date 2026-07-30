<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasDynamicImageFields;

class Image extends Model
{
    use HasFactory, HasDynamicImageFields;

    protected $table = 'images';
    protected $primaryKey = 'image_ID';
    public $timestamps = false; // Based on ER, no timestamps

    protected $fillable = [
        'post_FK',
        'url',
    ];

    public function getUrlAttribute($value)
    {
        return $this->formatImageUrl($value);
    }

    public function setUrlAttribute($value)
    {
        $this->attributes['url'] = $this->extractImageFilename($value);
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }
}
