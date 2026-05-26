<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Helper to run DatabaseSeeder
    }

    public function test_can_get_posts()
    {
        $response = $this->getJson('/api/posts');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'post_ID',
                'name',
                'flight', // Check polymorphic relations
                'accommodation',
                'package',
            ]
        ]);
    }

    public function test_can_get_single_post()
    {
        // Get first post to find its ID
        $post = \App\Models\Post::first();
        
        if ($post) {
            $response = $this->getJson('/api/posts/' . $post->post_ID);
            $response->assertStatus(200)
                     ->assertJson(['post_ID' => $post->post_ID]);
        } else {
             $this->markTestSkipped('No posts found in database');
        }
    }
}
