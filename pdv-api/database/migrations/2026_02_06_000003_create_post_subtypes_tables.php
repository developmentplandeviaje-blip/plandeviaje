<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id('flights_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->string('destination');
            $table->foreignId('country_FK')->constrained('countries', 'country_ID');
            $table->string('map_location');
            $table->text('features');
            $table->text('requirements');
            $table->decimal('starting_price', 10, 2);
        });

        Schema::create('accommodation', function (Blueprint $table) {
            $table->id('accommodation_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->string('destination');
            $table->string('map_location');
            $table->decimal('starting_price', 10, 2);
            $table->string('days');
            $table->integer('stars');
            $table->foreignId('guest_type_FK')->constrained('guest_types', 'guest_type_ID');
            $table->foreignId('board_type_FK')->constrained('board_types', 'board_type_ID');
        });

        Schema::create('packages', function (Blueprint $table) {
            $table->id('packages_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->foreignId('accommodation_FK')->constrained('accommodation', 'accommodation_ID');
            $table->text('features');
            $table->decimal('starting_price', 10, 2);
            $table->string('days');
            $table->foreignId('guest_type_FK')->constrained('guest_types', 'guest_type_ID');
            $table->foreignId('board_type_FK')->constrained('board_types', 'board_type_ID');
            $table->boolean('isActive');
            $table->boolean('isFeatured');
            $table->timestamp('end_date');
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id('blog_post_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->foreignId('blog_category_FK')->constrained('blog_categories', 'blog_category_ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
        Schema::dropIfExists('packages'); // Drop packages before accommodation due to FK constraint
        Schema::dropIfExists('accommodation');
        Schema::dropIfExists('blog_posts');
    }
};
