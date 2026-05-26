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
        Schema::table('flights', function (Blueprint $table) {
            $table->foreignId('guest_type_FK')->nullable()->constrained('guest_types', 'guest_type_ID');
            $table->foreignId('board_type_FK')->nullable()->constrained('board_types', 'board_type_ID');
            $table->boolean('isActive')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flights', function (Blueprint $table) {
            $table->dropForeign(['guest_type_FK']);
            $table->dropForeign(['board_type_FK']);
            $table->dropColumn(['guest_type_FK', 'board_type_FK', 'isActive']);
        });
    }
};
