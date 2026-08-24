<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_update_settings_bulk_traditional_data()
    {
        $user = User::factory()->create([
            'role' => 1
        ]);

        Sanctum::actingAs($user);

        $payload = [
            'contact_phone' => '+58 414 1234567',
            'contact_email' => 'info@planiaturuta.com',
            'contact_address' => 'Av. Principal',
            '_setting_group' => 'informacion'
        ];

        $response = $this->postJson('/api/settings/bulk', $payload);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Configuraciones actualizadas correctamente']);

        $this->assertDatabaseHas('settings', [
            'key' => 'contact_phone',
            'value' => '+58 414 1234567',
            'group' => 'informacion'
        ]);

        $this->assertDatabaseHas('settings', [
            'key' => 'contact_email',
            'value' => 'info@planiaturuta.com',
            'group' => 'informacion'
        ]);
    }

    public function test_can_update_settings_bulk_with_files()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => 1
        ]);

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->image('banner.jpg');

        $payload = [
            'home_banner_main' => $file,
            '_setting_group' => 'imagenes'
        ];

        $response = $this->post('/api/settings/bulk', $payload);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Configuraciones actualizadas correctamente']);

        $setting = Setting::where('key', 'home_banner_main')->first();
        $this->assertNotNull($setting);
        $this->assertEquals('image', $setting->type);
        $this->assertEquals('imagenes', $setting->group);

        $filename = $setting->getRawOriginal('value');
        Storage::disk('public')->assertExists('uploads/' . $filename);
    }
}
