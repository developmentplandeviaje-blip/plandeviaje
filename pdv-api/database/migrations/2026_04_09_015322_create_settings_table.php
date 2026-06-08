<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->string('type')->default('string');
                $table->string('group')->default('general');
                $table->timestamps();
            });

            // Insertamos datos básicos para que React no reciba un objeto vacío
            DB::table('settings')->insert([
                ['key' => 'site_name', 'value' => 'Plan de Viaje', 'type' => 'string', 'group' => 'general'],
                ['key' => 'currency', 'value' => 'USD', 'type' => 'string', 'group' => 'general'],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};