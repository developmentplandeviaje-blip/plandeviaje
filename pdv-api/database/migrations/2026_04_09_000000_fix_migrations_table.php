<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration fixes the 'migrations' table itself, which might be missing
     * a primary key or auto_increment if it was imported from a flawed SQL dump.
     */
    public function up(): void
    {
        $tableName = config('database.migrations.table', 'migrations');
        
        // Check if the table exists first
        if (!Schema::hasTable($tableName)) {
            return;
        }

        // Check if id column has auto_increment
        $result = DB::select("SHOW COLUMNS FROM {$tableName} WHERE Field = 'id'");
        
        if (!empty($result) && strpos($result[0]->Extra, 'auto_increment') === false) {
            echo "Repairing migrations table...\n";

            // Backup current migrations avoiding duplicates
            $migrations = DB::table($tableName)
                ->select('migration', 'batch')
                ->distinct()
                ->get();

            // Rename old table instead of dropping immediately
            $oldTableName = $tableName . '_old_' . time();
            DB::statement("RENAME TABLE {$tableName} TO {$oldTableName}");
            
            // Recreate the table with the correct structure (PK and AI)
            Schema::create($tableName, function ($table) {
                $table->increments('id');
                $table->string('migration');
                $table->integer('batch');
            });

            // Restore the records
            foreach ($migrations as $m) {
                DB::table($tableName)->insert([
                    'migration' => $m->migration,
                    'batch' => $m->batch
                ]);
            }
            
            // Drop the old table
            Schema::drop($oldTableName);
            
            echo "Migrations table repaired successfully.\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down migration needed for a repair
    }
};
