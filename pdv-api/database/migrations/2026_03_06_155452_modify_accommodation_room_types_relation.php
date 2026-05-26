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
        // 1. Drop existing FK from accommodation (from the previous migration)
        Schema::table('accommodation', function (Blueprint $table) {
            $table->dropForeign(['room_type_FK']);
            $table->dropColumn('room_type_FK');
        });

        // 2. Create the pivot table
        Schema::create('accommodation_room_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained('accommodation', 'accommodation_ID')->onDelete('cascade');
            $table->foreignId('room_type_id')->constrained('room_types', 'room_type_ID')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert table accommodation
        Schema::table('accommodation', function (Blueprint $table) {
            $table->foreignId('room_type_FK')->nullable()->after('features')->constrained('room_types', 'room_type_ID');
        });

        // 2. Drop the pivot table
        Schema::dropIfExists('accommodation_room_type');
    }
};
