<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $table = 'images';
    protected $primaryKey = 'image_ID';
    public $timestamps = false; // Based on ER, no timestamps

    protected $fillable = [
        'post_FK',
        'url',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }
}
