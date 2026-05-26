<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Flight;

class PostUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\LookupSeeder::class);
    }

    public function test_can_update_flight()
    {
        // 1. Create Initial Data
        $response = $this->postJson('/api/flights', [
            'name' => 'Original Flight',
            'overview' => 'Original Overview',
            'destination' => 'Original City',
            'starting_price' => 100.00,
            'country_FK' => 1
        ]);
        $response->assertStatus(201);
        $flight = Flight::with('post')->where('destination', 'Original City')->first();

        // 2. Send Update Request
        $updateResponse = $this->putJson("/api/flights/{$flight->flight_ID}", [
            'name' => 'Updated Flight',
            'overview' => 'Updated Overview',
            'destination' => 'Updated City',
            'starting_price' => 200.00,
            'country_FK' => 1,
            'images' => ['http://new-image.jpg']
        ]);

        $updateResponse->assertStatus(200);

        // 3. Verify Database
        $this->assertDatabaseHas('posts', [
            'post_ID' => $flight->post_FK,
            'name' => 'Updated Flight'
        ]);
        
        $this->assertDatabaseHas('flights', [
            'flight_ID' => $flight->flight_ID,
            'destination' => 'Updated City'
        ]);

        $this->assertDatabaseHas('images', [
            'post_FK' => $flight->post_FK,
            'url' => 'http://new-image.jpg'
        ]);
    }
}
