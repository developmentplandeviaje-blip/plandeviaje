<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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

            $settings = $query->get()->keyBy('key')->map(function($setting) {
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
}