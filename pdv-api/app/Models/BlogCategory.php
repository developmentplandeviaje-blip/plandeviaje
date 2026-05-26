<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasFactory;

    protected $table = 'blog_categories';
    protected $primaryKey = 'blog_category_ID';
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'blog_category_FK', 'blog_category_ID');
    }
}
