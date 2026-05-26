<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Accommodation;

class LookupAccommodationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\LookupSeeder::class);
    }

    public function test_can_fetch_accommodations_list()
    {
        // Must seed some data first
        $response = $this->postJson('/api/accommodations', [
            'name' => 'Existing Hotel',
            'overview' => 'Overview',
            'destination' => 'City',
            'starting_price' => 200.00,
            'guest_type_FK' => 1,
            'board_type_FK' => 1
        ]);

        $response = $this->getJson('/api/lookups');
        $response->assertStatus(200)
                 ->assertJsonStructure(['accommodations']);
        
        $accommodations = $response->json('accommodations');
        $this->assertNotEmpty($accommodations);
        $this->assertEquals('Existing Hotel', $accommodations[0]['name']);
    }

    public function test_can_create_new_accommodation_inline()
    {
        $response = $this->postJson('/api/lookups/accommodations', ['name' => 'New Inline Hotel']);
        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'New Inline Hotel']);

        // Check it was created with placeholders
        $this->assertDatabaseHas('posts', ['name' => 'New Inline Hotel', 'overview' => 'Pending overview']);
        $this->assertDatabaseHas('accommodation', ['destination' => 'Pending Destination']);
    }
}
