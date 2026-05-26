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
        Schema::create('countries', function (Blueprint $table) {
            $table->id('country_ID');
            $table->string('name');
        });

        Schema::create('board_types', function (Blueprint $table) {
            $table->id('board_type_ID');
            $table->string('type');
        });

        Schema::create('guest_types', function (Blueprint $table) {
            $table->id('guest_type_ID');
            $table->string('type');
        });

        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id('blog_category_ID');
            $table->string('name');
        });

        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id('blog_tag_ID');
            $table->string('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
        Schema::dropIfExists('board_types');
        Schema::dropIfExists('guest_types');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('blog_tags');
    }
};
