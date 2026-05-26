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
            if (Schema::hasColumn('flights', 'guest_type_FK')) {
                $table->dropForeign('flights_guest_type_fk_foreign');
                $table->dropColumn('guest_type_FK');
            }
            if (Schema::hasColumn('flights', 'board_type_FK')) {
                $table->dropForeign('flights_board_type_fk_foreign');
                $table->dropColumn('board_type_FK');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('flights', function (Blueprint $table) {
            $table->bigInteger('guest_type_FK')->unsigned()->nullable();
            $table->bigInteger('board_type_FK')->unsigned()->nullable();
            
            $table->foreign('guest_type_FK')->references('guest_type_ID')->on('guest_types');
            $table->foreign('board_type_FK')->references('board_type_ID')->on('board_types');
        });
    }
};
