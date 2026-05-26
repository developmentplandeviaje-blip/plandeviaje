<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\BlogTag;

class TagTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\LookupSeeder::class);
    }

    public function test_can_create_new_tag()
    {
        $response = $this->postJson('/api/lookups/blog-tags', ['name' => 'New-News']);
        $response->assertStatus(201);
        $this->assertDatabaseHas('blog_tags', ['name' => 'New-News']);
    }

    public function test_can_create_blog_post_with_tags()
    {
        $tag1 = BlogTag::create(['name' => 'Tech']);
        $tag2 = BlogTag::create(['name' => 'Review']);

        $response = $this->postJson('/api/blog-posts', [
            'name' => 'My Tech Review',
            'overview' => 'Review of things',
            'blog_category_FK' => 1,
            'tags' => [$tag1->blog_tag_ID, $tag2->blog_tag_ID]
        ]);

        $response->assertStatus(201);
        
        // Check Post Exists
        $this->assertDatabaseHas('posts', ['name' => 'My Tech Review']);
        
        // Get the created blog post (ID might be different from post_ID)
        $blogPost = \App\Models\BlogPost::whereHas('post', function($q) {
            $q->where('name', 'My Tech Review');
        })->first();

        // Check Tags are synced
        $this->assertDatabaseHas('blog_posts_tags', [
            'blog_post_FK' => $blogPost->blog_post_ID,
            'blog_tag_FK' => $tag1->blog_tag_ID
        ]);
        $this->assertDatabaseHas('blog_posts_tags', [
            'blog_post_FK' => $blogPost->blog_post_ID,
            'blog_tag_FK' => $tag2->blog_tag_ID
        ]);
    }
}
