<?php

namespace App\Http\Controllers;

use App\Models\TestimonioExperiencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestimonioExperienciaController extends Controller
{
    /**
     * Almacena una nueva respuesta del cuestionario de experiencia.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'atencion_calificacion'               => 'required|integer|between:1,5',
            'atencion_representante_calificacion' => 'nullable|integer|between:1,5',
            'itinerario_calificacion'             => 'required|integer|between:1,5',
            'calidad_calificacion'                => 'nullable|integer|between:1,5',
            'experiencia_calificacion'            => 'required|integer|between:1,5',
            'desempeno_ventas'                    => 'required|boolean',
            'recomendacion'                       => 'required|boolean',
            'fidelidad'                           => 'required|boolean',
            'comentarios'                         => 'nullable|string|max:2000',
            'referencia_viaje'                    => 'nullable|string|max:255',
        ]);

        $testimonio = TestimonioExperiencia::create($validated);

        return response()->json([
            'success' => true,
            'message' => '¡Gracias por su opinión! Tu experiencia nos ayuda a seguir mejorando.',
            'data'    => $testimonio
        ], 201);
    }

    /**
     * Retorna las respuestas recibidas junto a las métricas analíticas.
     */
    public function index(Request $request)
    {
        $query = TestimonioExperiencia::query();

        // Filtro opcional por búsqueda en comentarios o referencia
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('comentarios', 'like', "%{$search}%")
                    ->orWhere('referencia_viaje', 'like', "%{$search}%");
            });
        }

        // Filtro por nivel de satisfacción (ej: bajas <= 3, altas >= 4, o solo comentarios)
        if ($request->input('filter') === 'low') {
            $query->where(function ($q) {
                $q->where('atencion_calificacion', '<=', 3)
                    ->orWhere('itinerario_calificacion', '<=', 3)
                    ->orWhere('experiencia_calificacion', '<=', 3);
            });
        } elseif ($request->input('filter') === 'comments') {
            $query->whereNotNull('comentarios')->where('comentarios', '!=', '');
        }

        $totalRespuestas = TestimonioExperiencia::count();

        if ($totalRespuestas === 0) {
            return response()->json([
                'metrics' => [
                    'total_respuestas'             => 0,
                    'promedio_general'             => 0,
                    'promedios_desglose'           => [
                        'atencion'               => 0,
                        'itinerario'             => 0,
                        'experiencia'            => 0,
                    ],
                    'porcentaje_desempeno_ventas'  => 0,
                    'porcentaje_recomendacion'     => 0,
                    'porcentaje_fidelidad'         => 0,
                    'conteo_desempeno_ventas'      => ['si' => 0, 'no' => 0],
                    'conteo_recomendacion'         => ['si' => 0, 'no' => 0],
                    'conteo_fidelidad'             => ['si' => 0, 'no' => 0],
                ],
                'testimonios' => [
                    'data' => [],
                    'total' => 0
                ]
            ]);
        }

        // Cálculo de métricas
        $avgAtencion = (float) TestimonioExperiencia::avg('atencion_calificacion');
        $avgItinerario = (float) TestimonioExperiencia::avg('itinerario_calificacion');
        $avgExperiencia = (float) TestimonioExperiencia::avg('experiencia_calificacion');

        $promedioGeneral = round(($avgAtencion + $avgItinerario + $avgExperiencia) / 3, 2);

        $totalDesempenoVentasSi = TestimonioExperiencia::where('desempeno_ventas', true)->count();
        $totalDesempenoVentasNo = TestimonioExperiencia::where('desempeno_ventas', false)->count();

        $totalRecomendacionSi = TestimonioExperiencia::where('recomendacion', true)->count();
        $totalRecomendacionNo = TestimonioExperiencia::where('recomendacion', false)->count();

        $totalFidelidadSi = TestimonioExperiencia::where('fidelidad', true)->count();
        $totalFidelidadNo = TestimonioExperiencia::where('fidelidad', false)->count();

        $porcentajeDesempenoVentas = round(($totalDesempenoVentasSi / $totalRespuestas) * 100, 1);
        $porcentajeRecomendacion = round(($totalRecomendacionSi / $totalRespuestas) * 100, 1);
        $porcentajeFidelidad = round(($totalFidelidadSi / $totalRespuestas) * 100, 1);

        $perPage = $request->input('per_page', 15);
        $testimonios = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'metrics' => [
                'total_respuestas'             => $totalRespuestas,
                'promedio_general'             => $promedioGeneral,
                'promedios_desglose'           => [
                    'atencion'               => round($avgAtencion, 2),
                    'itinerario'             => round($avgItinerario, 2),
                    'experiencia'            => round($avgExperiencia, 2),
                ],
                'porcentaje_desempeno_ventas'  => $porcentajeDesempenoVentas,
                'porcentaje_recomendacion'     => $porcentajeRecomendacion,
                'porcentaje_fidelidad'         => $porcentajeFidelidad,
                'conteo_desempeno_ventas'      => [
                    'si' => $totalDesempenoVentasSi,
                    'no' => $totalDesempenoVentasNo,
                ],
                'conteo_recomendacion'         => [
                    'si' => $totalRecomendacionSi,
                    'no' => $totalRecomendacionNo,
                ],
                'conteo_fidelidad'             => [
                    'si' => $totalFidelidadSi,
                    'no' => $totalFidelidadNo,
                ],
            ],
            'testimonios' => $testimonios
        ]);
    }

    /**
     * Elimina un registro de testimonio.
     */
    public function destroy($id)
    {
        $testimonio = TestimonioExperiencia::findOrFail($id);
        $testimonio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Testimonio eliminado exitosamente'
        ]);
    }
}
