<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── Eloquent Strict Mode (dev only) ──────────────────────────────
        // Prevents lazy loading (N+1 detection), silently discarding attributes,
        // and accessing missing attributes.
        Model::shouldBeStrict(!app()->isProduction());

        // ── Disable destructive migrations in production ─────────────────
        // Prevents accidental `migrate:fresh` or `migrate:refresh` in production.
        DB::prohibitDestructiveCommands(app()->isProduction());

        // Forzar HTTPS en el entorno de producción (Railway)
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
