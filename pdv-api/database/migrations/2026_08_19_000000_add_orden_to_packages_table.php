<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->integer('orden')->default(0)->after('packages_ID');
        });

        // Rellenar consecutivamente el valor de orden en los registros existentes
        $packages = DB::table('packages')->orderBy('packages_ID', 'asc')->get();
        $index = 1;
        foreach ($packages as $pkg) {
            DB::table('packages')
                ->where('packages_ID', $pkg->packages_ID)
                ->update(['orden' => $index++]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('orden');
        });
    }
};
