<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\BoardType;
use App\Models\Country;
use App\Models\GuestType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LookupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Countries
        $countries = ['USA', 'UK', 'Spain', 'France', 'Italy', 'Japan', 'Australia', 'Canada', 'Germany', 'Brazil'];
        foreach ($countries as $country) {
            Country::create(['name' => $country]);
        }

        // Board Types
        $boardTypes = ['All Inclusive', 'Breakfast Only', 'Half Board', 'Full Board', 'Room Only'];
        foreach ($boardTypes as $type) {
            BoardType::create(['type' => $type]);
        }

        // Guest Types
        $guestTypes = ['Couple', 'Family', 'Solo', 'Group', 'Business'];
        foreach ($guestTypes as $type) {
            GuestType::create(['type' => $type]);
        }

        // Blog Categories
        $categories = ['Travel Tips', 'Destinations', 'Food & Drink', 'Culture', 'Adventures'];
        foreach ($categories as $category) {
            BlogCategory::create(['name' => $category]);
        }

        // Blog Tags
        $tags = ['Beach', 'Mountain', 'City', 'Nature', 'Luxury', 'Budget', 'Backpacking'];
        foreach ($tags as $tag) {
            BlogTag::create(['name' => $tag]);
        }
    }
}
