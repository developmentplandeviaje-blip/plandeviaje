<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LookupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed lookups so we have initial data
        $this->seed(\Database\Seeders\LookupSeeder::class);
    }

    public function test_can_fetch_all_lookups()
    {
        $response = $this->getJson('/api/lookups');
        
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'countries',
                     'guest_types',
                     'board_types',
                     'blog_categories'
                 ]);
        
        // Assert we have data from seeder
        $this->assertNotEmpty($response->json('countries'));
    }

    public function test_can_create_new_country()
    {
        $response = $this->postJson('/api/lookups/countries', ['name' => 'New Country']);
        $response->assertStatus(201);
        $this->assertDatabaseHas('countries', ['name' => 'New Country']);
    }

    public function test_can_create_new_guest_type()
    {
        $response = $this->postJson('/api/lookups/guest-types', ['type' => 'Robots']);
        $response->assertStatus(201);
        $this->assertDatabaseHas('guest_types', ['type' => 'Robots']);
    }
}
