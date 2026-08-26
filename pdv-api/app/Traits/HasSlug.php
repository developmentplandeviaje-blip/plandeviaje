<?php

namespace App\Traits;

use App\Models\Post;
use Illuminate\Support\Str;

trait HasSlug
{
    /**
     * Boot the HasSlug trait for Eloquent models.
     */
    public static function bootHasSlug()
    {
        static::saving(function ($model) {
            $name = null;
            if ($model->post) {
                $name = $model->post->name;
            } else {
                $post = Post::find($model->post_FK);
                if ($post) {
                    $name = $post->name;
                }
            }

            if ($name) {
                $model->slug = static::generateUniqueSlug($name, $model->getKey());
            }
        });

        static::saved(function ($model) {
            \Illuminate\Support\Facades\Cache::forget('sitemap.xml');
        });

        static::deleted(function ($model) {
            \Illuminate\Support\Facades\Cache::forget('sitemap.xml');
        });
    }

    /**
     * Generate a unique slug based on a name.
     */
    public static function generateUniqueSlug(string $name, $currentId = null): string
    {
        $baseSlug = Str::slug($name);
        if (empty($baseSlug)) {
            $baseSlug = 'item';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (true) {
            $query = static::where('slug', $slug);
            if ($currentId) {
                $query->where((new static)->getKeyName(), '!=', $currentId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = $baseSlug . '-' . $counter++;
        }

        return $slug;
    }
}
