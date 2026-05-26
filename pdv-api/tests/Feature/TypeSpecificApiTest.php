<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TypeSpecificApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_get_flights()
    {
        $response = $this->getJson('/api/flights');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'flights_ID',
                         'destination',
                         'post' => [ // Check parent post relationship
                             'post_ID',
                             'name',
                             'images'
                         ]
                     ]
                 ]);
    }

    public function test_can_get_accommodations()
    {
        $response = $this->getJson('/api/accommodations');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'accommodation_ID',
                         'destination',
                         'post' => [
                             'post_ID',
                             'name',
                             'images'
                         ]
                     ]
                 ]);
    }

    public function test_can_get_packages()
    {
        $response = $this->getJson('/api/packages');
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'packages_ID',
                         'starting_price',
                         'post' => [
                             'post_ID',
                             'name'
                         ]
                     ]
                 ]);
    }
}
