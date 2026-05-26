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
        // 1. Create room_types table
        Schema::create('room_types', function (Blueprint $table) {
            $table->id('room_type_ID');
            $table->string('type');
        });

        // 2. Add features, room_type_FK, and isActive to accommodation table
        Schema::table('accommodation', function (Blueprint $table) {
            $table->text('features')->nullable()->after('stars');
            $table->foreignId('room_type_FK')->nullable()->after('features')->constrained('room_types', 'room_type_ID');
            $table->boolean('isActive')->default(true)->after('room_type_FK');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Drop columns and foreign key from accommodation table
        Schema::table('accommodation', function (Blueprint $table) {
            $table->dropForeign(['room_type_FK']); // Drop FK first
            $table->dropColumn(['features', 'room_type_FK', 'isActive']);
        });

        // 2. Drop room_types table
        Schema::dropIfExists('room_types');
    }
};
