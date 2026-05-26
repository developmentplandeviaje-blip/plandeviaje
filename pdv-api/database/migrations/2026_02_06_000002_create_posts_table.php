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
        Schema::create('posts', function (Blueprint $table) {
            $table->id('post_ID');
            $table->string('name');
            $table->string('overview');
            $table->text('information');
            $table->string('banner');
            $table->string('thumbnail');
            $table->foreignId('createdBy')->constrained('users', 'user_ID');
            $table->foreignId('updatedBy')->constrained('users', 'user_ID');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
