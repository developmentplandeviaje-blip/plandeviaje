<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Añadir la columna slug como nullable si no existe
        if (!Schema::hasColumn('packages', 'slug')) {
            Schema::table('packages', function (Blueprint $table) {
                $table->string('slug', 255)->nullable()->after('packages_ID')->index();
            });
        }
        if (!Schema::hasColumn('accommodation', 'slug')) {
            Schema::table('accommodation', function (Blueprint $table) {
                $table->string('slug', 255)->nullable()->after('accommodation_ID')->index();
            });
        }
        if (!Schema::hasColumn('flights', 'slug')) {
            Schema::table('flights', function (Blueprint $table) {
                $table->string('slug', 255)->nullable()->after('flights_ID')->index();
            });
        }

        // 2. Poblar automáticamente la columna slug de todos los registros existentes
        $this->populateSlugs('packages', 'packages_ID');
        $this->populateSlugs('accommodation', 'accommodation_ID');
        $this->populateSlugs('flights', 'flights_ID');

        // 3. Hacer que las columnas sean UNIQUE y NOT NULL si no tienen la restricción única aplicada
        // Nota: en Laravel/MySQL, podemos volver a declarar la columna como unique. Para evitar duplicados de índices,
        // podemos simplemente cambiar el tipo y añadir la restricción única de forma segura.
        try {
            Schema::table('packages', function (Blueprint $table) {
                $table->string('slug', 255)->nullable(false)->unique()->change();
            });
        } catch (\Exception $e) {
            // Ignorar si el índice único ya existe
        }

        try {
            Schema::table('accommodation', function (Blueprint $table) {
                $table->string('slug', 255)->nullable(false)->unique()->change();
            });
        } catch (\Exception $e) {
            // Ignorar si el índice único ya existe
        }

        try {
            Schema::table('flights', function (Blueprint $table) {
                $table->string('slug', 255)->nullable(false)->unique()->change();
            });
        } catch (\Exception $e) {
            // Ignorar si el índice único ya existe
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('accommodation', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('flights', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }

    private function populateSlugs(string $table, string $primaryKey): void
    {
        $records = DB::table($table)->get();
        foreach ($records as $record) {
            // Si ya tiene un slug no nulo ni vacío, no lo sobrescribimos para no alterar datos manuales
            if (!empty($record->slug)) {
                continue;
            }

            $post = DB::table('posts')->where('post_ID', $record->post_FK)->first();
            $name = $post ? $post->name : 'item';
            
            $baseSlug = Str::slug($name);
            if (empty($baseSlug)) {
                $baseSlug = 'item';
            }
            
            $slug = $baseSlug;
            $counter = 1;
            
            while (DB::table($table)->where('slug', $slug)->where($primaryKey, '!=', $record->$primaryKey)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }
            
            DB::table($table)->where($primaryKey, $record->$primaryKey)->update(['slug' => $slug]);
        }
    }
};
