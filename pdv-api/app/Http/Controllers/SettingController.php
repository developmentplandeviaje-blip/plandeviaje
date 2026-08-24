<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $group = $request->query('group');

            // Obtenemos los settings y los formateamos como pide tu React
            $query = Setting::query();

            if ($group) {
                $query->where('group', $group);
            }

            $settings = $query->get()->keyBy('key')->map(function ($setting) {
                // Si es JSON en la DB, lo decodificamos
                if ($setting->type === 'json' && is_string($setting->value)) {
                    $setting->value = json_decode($setting->value, true);
                }
                return $setting;
            });

            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cargar configuraciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateBulk(Request $request)
    {
        try {
            $group = $request->input('_setting_group', 'general');

            // Get all fields except internal ones
            $data = $request->all();
            unset($data['_setting_group']);

            foreach ($data as $key => $value) {
                $type = 'string';

                if ($request->hasFile($key)) {
                    $file = $request->file($key);
                    $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                    $file->storeAs('uploads', $filename, 'public');
                    $value = $filename;
                    $type = 'image';
                } else if (is_array($value) || is_object($value)) {
                    $value = json_encode($value);
                    $type = 'json';
                }

                $setting = Setting::where('key', $key)->first();
                if ($setting) {
                    if ($request->hasFile($key)) {
                        $setting->type = 'image';
                    }
                    $setting->value = $value;
                    $setting->group = $group;
                    $setting->save();
                } else {
                    $setting = new Setting();
                    $setting->key = $key;
                    $setting->type = $type;
                    $setting->value = $value;
                    $setting->group = $group;
                    $setting->save();
                }
            }

            return response()->json([
                'message' => 'Configuraciones actualizadas correctamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar configuraciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
