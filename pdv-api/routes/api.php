<?php

use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ConsultantController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\WhatsappWebhookController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\LookupController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

// ── Authentication ────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // Max 5 attempts per minute

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Admin only routes
    Route::middleware('role:1')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
    });
});

// ── Public Read-Only Routes ───────────────────────────────────────────────────
Route::get('/flights', [FlightController::class, 'index']);
Route::get('/flights/{flight}', [FlightController::class, 'show']);
Route::get('/accommodations', [AccommodationController::class, 'index']);
Route::get('/accommodations/{accommodation}', [AccommodationController::class, 'show']);
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{package}', [PackageController::class, 'show']);
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{blogPost}', [BlogPostController::class, 'show']);
Route::get('/lookups', [LookupController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);

// Public inquiry submission (rate limited)
Route::post('/consultas', [InquiryController::class, 'store'])
    ->middleware('throttle:10,1'); // Max 10 inquiries per minute

// ── Protected Content Management (Admin + Editor) ─────────────────────────────
Route::middleware(['auth:sanctum', 'role:1,2'])->group(function () {
    // Flights
    Route::post('/flights', [FlightController::class, 'store']);
    Route::put('/flights/{flight}', [FlightController::class, 'update']);
    Route::delete('/flights/{flight}', [FlightController::class, 'destroy']);

    // Accommodations
    Route::post('/accommodations', [AccommodationController::class, 'store']);
    Route::put('/accommodations/{accommodation}', [AccommodationController::class, 'update']);
    Route::delete('/accommodations/{accommodation}', [AccommodationController::class, 'destroy']);

    // Packages
    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{package}', [PackageController::class, 'update']);
    Route::delete('/packages/{package}', [PackageController::class, 'destroy']);

    // Blog Posts
    Route::post('/blog-posts', [BlogPostController::class, 'store']);
    Route::put('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);
    Route::delete('/blog-posts/{blogPost}', [BlogPostController::class, 'destroy']);

    // Lookups
    Route::post('/lookups/countries', [LookupController::class, 'storeCountry']);
    Route::post('/lookups/guest-types', [LookupController::class, 'storeGuestType']);
    Route::post('/lookups/board-types', [LookupController::class, 'storeBoardType']);
    Route::post('/lookups/room-types', [LookupController::class, 'storeRoomType']);
    
    // CORRECCIÓN AQUÍ: Quitamos la "s" para que React las encuentre
    Route::post('/lookups/blog-category', [LookupController::class, 'storeBlogCategory']);
    Route::post('/lookups/blog-tag', [LookupController::class, 'storeBlogTag']);
    
    Route::post('/lookups/accommodations', [LookupController::class, 'storeAccommodation']);

    // Settings
    Route::post('/settings/bulk', [SettingController::class, 'updateBulk']);

    // Uploads
    Route::post('/upload', [UploadController::class, 'storeImage']);
});

// ── WhatsApp Webhook (with shared secret) ─────────────────────────────────────
Route::post('/webhooks/whatsapp', [WhatsappWebhookController::class, 'handle']);

// ── Admin + Manager Routes (Consultants & Inquiries) ──────────────────────────
Route::middleware(['auth:sanctum', 'role:1,3'])->group(function () {
    // Consultant management
    Route::apiResource('consultants', ConsultantController::class);

    // Inquiries management
    Route::get('/consultas', [InquiryController::class, 'index']);
    Route::get('/consultas/{inquiry}', [InquiryController::class, 'show']);
    Route::post('/consultas/{inquiry}/assign', [InquiryController::class, 'assignConsultant']);
    Route::delete('/consultas/{inquiry}', [InquiryController::class, 'destroy']);

    // WhatsApp Configuration Proxy Routes
    Route::post('/whatsapp/pair', function (Request $request) {
        $validated = $request->validate(['phone' => 'required|string']);

        try {
            $response = Http::timeout(10)->post('http://localhost:3001/pair', [
                'phone' => $validated['phone'],
            ]);
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'connected' => false,
                'code'      => null,
                'error'     => 'Servicio de WhatsApp Node.js inactivo',
            ], 503);
        }
    });

    Route::get('/whatsapp/status', function () {
        try {
            $response = Http::timeout(5)->get('http://localhost:3001/status');
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'connected' => false,
                'error'     => 'Servicio de WhatsApp inactivo',
            ], 503);
        }
    });
});