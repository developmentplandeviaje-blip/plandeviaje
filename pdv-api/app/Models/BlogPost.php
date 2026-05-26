<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use HasFactory;

    protected $table = 'blog_posts';
    protected $primaryKey = 'blog_post_ID';
    public $timestamps = false;

    protected $fillable = [
        'post_FK',
        'blog_category_FK',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_FK', 'blog_category_ID');
    }

    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_posts_tags', 'blog_post_FK', 'blog_tag_FK', 'blog_post_ID', 'blog_tag_ID');
    }
}
