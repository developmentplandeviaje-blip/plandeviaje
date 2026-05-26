<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(LookupSeeder::class);

        $user = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 1,
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Editor User',
            'email' => 'editor@example.com',
            'role' => 2,
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'role' => 3,
            'password' => bcrypt('password'),
        ]);

        // Create a Flight Post
        $flightPost = \App\Models\Post::create([
            'name' => 'Flight to Paris',
            'overview' => 'Direct flight to Paris',
            'information' => 'Comfortable flight with great amenities.',
            'banner' => 'http://example.com/banner1.jpg',
            'thumbnail' => 'http://example.com/thumb1.jpg',
            'createdBy' => $user->user_ID,
            'updatedBy' => $user->user_ID,
        ]);

        \App\Models\Flight::create([
            'post_FK' => $flightPost->post_ID,
            'destination' => 'Paris',
            'country_FK' => 4, // France
            'map_location' => '48.8566, 2.3522',
            'features' => 'WiFi, Meals',
            'requirements' => 'Passport',
            'starting_price' => 500.00,
        ]);

        // Create an Accommodation Post
        $hotelPost = \App\Models\Post::create([
            'name' => 'Luxury Hotel in Rome',
            'overview' => '5-star stay in the heart of Rome',
            'information' => 'Experience luxury like never before.',
            'banner' => 'http://example.com/banner2.jpg',
            'thumbnail' => 'http://example.com/thumb2.jpg',
            'createdBy' => $user->user_ID,
            'updatedBy' => $user->user_ID,
        ]);

        $accommodation = \App\Models\Accommodation::create([
            'post_FK' => $hotelPost->post_ID,
            'destination' => 'Rome',
            'map_location' => '41.9028, 12.4964',
            'starting_price' => 200.00,
            'days' => '3 Days',
            'stars' => 5,
            'guest_type_FK' => 1, // Couple
            'board_type_FK' => 1, // All Inclusive
        ]);

        // Create a Package (linked to accommodation)
        $packagePost = \App\Models\Post::create([
            'name' => 'Rome Weekend Package',
            'overview' => 'Complete weekend package in Rome',
            'information' => 'Includes flight and hotel.',
            'banner' => 'http://example.com/banner3.jpg',
            'thumbnail' => 'http://example.com/thumb3.jpg',
            'createdBy' => $user->user_ID,
            'updatedBy' => $user->user_ID,
        ]);

        \App\Models\Package::create([
            'post_FK' => $packagePost->post_ID,
            'accommodation_FK' => $accommodation->accommodation_ID,
            'features' => 'City Tour, Breakfast',
            'starting_price' => 700.00,
            'days' => '3 Days',
            'guest_type_FK' => 1,
            'board_type_FK' => 1,
            'isActive' => true,
            'isFeatured' => true,
            'end_date' => now()->addMonth(),
        ]);
    }
}
