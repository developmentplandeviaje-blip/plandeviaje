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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id('inquiries_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone');
            $table->foreignId('guest_type_FK')->constrained('guest_types', 'guest_type_ID');
            $table->boolean('kids');
            $table->timestamp('from_date')->nullable();
            $table->timestamp('to_date')->nullable();
            $table->boolean('status');
        });

        Schema::create('images', function (Blueprint $table) {
            $table->id('image_ID');
            $table->foreignId('post_FK')->constrained('posts', 'post_ID')->onDelete('cascade');
            $table->string('url');
        });

        Schema::create('blog_posts_tags', function (Blueprint $table) {
            $table->id('blog_post_tag_ID');
            $table->foreignId('blog_post_FK')->constrained('blog_posts', 'blog_post_ID')->onDelete('cascade');
            $table->foreignId('blog_tag_FK')->constrained('blog_tags', 'blog_tag_ID')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('images');
        Schema::dropIfExists('blog_posts_tags');
    }
};
