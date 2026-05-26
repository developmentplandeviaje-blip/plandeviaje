<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogTag extends Model
{
    use HasFactory;

    protected $table = 'blog_tags';
    protected $primaryKey = 'blog_tag_ID';
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function blogPosts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_posts_tags', 'blog_tag_FK', 'blog_post_FK', 'blog_tag_ID', 'blog_post_ID');
    }
}
