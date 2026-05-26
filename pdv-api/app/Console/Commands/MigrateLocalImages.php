<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MigrateLocalImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:migrate-local';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download external images from database and save them locally.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting image migration...");
        
        $this->migrateTable('posts', 'post_ID', ['banner', 'thumbnail']);
        $this->migrateTable('images', 'image_ID', ['url']);
        $this->migrateTable('consultants', 'id', ['img']);
        $this->migrateTable('settings', 'id', ['value'], "type = 'image'");
        
        $this->info("Migration completed.");
    }
    
    private function migrateTable($table, $idCol, $columns, $extraCondition = null)
    {
        $this->info("Migrating table: $table");
        
        foreach ($columns as $col) {
            $query = DB::table($table)->where($col, 'like', 'http%');
            if ($extraCondition) {
                $query->whereRaw($extraCondition);
            }
            
            $rows = $query->get();
            $this->info("Found " . $rows->count() . " external URLs in $table.$col");
            
            foreach ($rows as $row) {
                $url = $row->$col;
                $localUrl = $this->downloadAndSave($url);
                if ($localUrl) {
                    DB::table($table)->where($idCol, $row->$idCol)->update([$col => $localUrl]);
                    $this->info("  [OK] Migrated: $url -> $localUrl");
                } else {
                    $this->error("  [FAIL] Could not download: $url");
                }
            }
        }
    }
    
    private function downloadAndSave($url)
    {
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                // Get extension from URL or fallback to jpg
                $path = parse_url($url, PHP_URL_PATH);
                $ext = pathinfo($path, PATHINFO_EXTENSION);
                if (empty($ext) || !in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                    $ext = 'jpg';
                }
                
                $filename = 'uploads/migrated_' . time() . '_' . Str::random(5) . '.' . $ext;
                
                Storage::disk('public')->put($filename, $response->body());
                return '/storage/' . $filename;
            }
        } catch (\Exception $e) {
            return null;
        }
        return null;
    }
}
