<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_create_flight_with_full_details()
    {
        $response = $this->postJson('/api/flights', [
            'name' => 'Detailed Flight',
            'overview' => 'Full overview',
            'information' => 'Extra info',
            'banner' => 'http://banner.jpg',
            'thumbnail' => 'http://thumb.jpg',
            'images' => ['http://img1.jpg', 'http://img2.jpg'],
            'destination' => 'Test City',
            'starting_price' => 100.50,
            'country_FK' => 1,
            'map_location' => '123,456',
            'features' => 'wifi,meal',
            'requirements' => 'visa'
        ]);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('posts', ['name' => 'Detailed Flight', 'banner' => 'http://banner.jpg']);
        $this->assertDatabaseHas('flights', ['features' => 'wifi,meal']);
        
        // specific check for images would require knowing post ID or counting
        $this->assertDatabaseHas('images', ['url' => 'http://img1.jpg']);
    }

    public function test_can_create_accommodation_with_full_details()
    {
        $response = $this->postJson('/api/accommodations', [
            'name' => 'Full Hotel',
            'overview' => 'Overview',
            'destination' => 'City',
            'starting_price' => 200.00,
            'guest_type_FK' => 1,
            'board_type_FK' => 1,
            'days' => '5 Days',
            'stars' => 4,
            'images' => ['http://hotel.jpg']
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('accommodation', ['days' => '5 Days', 'stars' => 4]);
        $this->assertDatabaseHas('images', ['url' => 'http://hotel.jpg']);
    }

    public function test_can_create_package_with_full_details()
    {
        $acc = \App\Models\Accommodation::first();

        $response = $this->postJson('/api/packages', [
            'name' => 'Full Package',
            'overview' => 'Overview',
            'starting_price' => 999.00,
            'accommodation_FK' => $acc->accommodation_ID,
            'guest_type_FK' => 1,
            'board_type_FK' => 1,
            'features' => 'Tours',
            'isActive' => true,
            'isFeatured' => true
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('packages', ['features' => 'Tours', 'isActive' => 1]);
    }
}
