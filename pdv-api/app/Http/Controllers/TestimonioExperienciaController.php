<?php

namespace App\Http\Controllers;

use App\Models\TestimonioExperiencia;
use App\Models\TestimonioEnlace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestimonioExperienciaController extends Controller
{
    /**
     * Genera un nuevo enlace único rastreable de encuesta con límite de 3 usos.
     */
    public function generarEnlace(Request $request)
    {
        $referencia = trim($request->input('referencia_viaje') ?? '');

        if ($referencia !== '') {
            $enlace = TestimonioEnlace::where('token', $referencia)
                ->orWhere('referencia_viaje', $referencia)
                ->first();

            if ($enlace) {
                $enlace->update([
                    'token'            => $referencia,
                    'referencia_viaje' => $referencia,
                    'accesos_count'    => 0,
                    'max_usos'         => 3,
                ]);
            } else {
                $enlace = TestimonioEnlace::create([
                    'token'            => $referencia,
                    'referencia_viaje' => $referencia,
                    'accesos_count'    => 0,
                    'max_usos'         => 3,
                ]);
            }

            return response()->json([
                'success'          => true,
                'token'            => $enlace->token,
                'referencia_viaje' => $enlace->referencia_viaje,
                'max_usos'         => $enlace->max_usos,
                'url_param'        => 'ref=' . urlencode($referencia),
            ], 201);
        } else {
            do {
                $token = 'PDV-' . strtoupper(Str::random(8));
            } while (TestimonioEnlace::where('token', $token)->exists());

            $enlace = TestimonioEnlace::create([
                'token'            => $token,
                'referencia_viaje' => null,
                'accesos_count'    => 0,
                'max_usos'         => 3,
            ]);

            return response()->json([
                'success'          => true,
                'token'            => $enlace->token,
                'referencia_viaje' => null,
                'max_usos'         => $enlace->max_usos,
                'url_param'        => 'token=' . urlencode($token),
            ], 201);
        }
    }

    /**
     * Valida el enlace/token antes de cargar el cuestionario e incrementa su contador de uso.
     */
    public function validarEnlace(Request $request)
    {
        $token = $request->input('token') ?? $request->input('ref');

        if (!$token) {
            $token = 'GENERAL';
        }

        $enlace = TestimonioEnlace::where('token', $token)
            ->orWhere('referencia_viaje', $token)
            ->first();

        if (!$enlace) {
            $enlace = TestimonioEnlace::create([
                'token'            => $token,
                'referencia_viaje' => $token !== 'GENERAL' ? $token : null,
                'accesos_count'    => 0,
                'max_usos'         => 3,
            ]);
        }

        // Si ya alcanzó o superó el máximo de respuestas permitidas (3 encuestas completadas)
        if ($enlace->accesos_count >= $enlace->max_usos) {
            return response()->json([
                'valido'        => false,
                'motivo'        => 'limite_excedido',
                'accesos_count' => $enlace->accesos_count,
                'max_usos'      => $enlace->max_usos,
                'message'       => 'Este enlace ha alcanzado el límite máximo de 3 respuestas permitidas. Por favor, comuníquese con Atención al Cliente para obtener un nuevo enlace.',
            ], 200);
        }

        return response()->json([
            'valido'            => true,
            'accesos_count'     => $enlace->accesos_count,
            'max_usos'          => $enlace->max_usos,
            'accesos_restantes' => max(0, $enlace->max_usos - $enlace->accesos_count),
            'referencia_viaje'  => $enlace->referencia_viaje,
        ], 200);
    }

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

        $refToken = $validated['referencia_viaje'] ?? null;
        $enlaceEncontrado = null;

        if ($refToken) {
            $enlaceEncontrado = TestimonioEnlace::where('token', $refToken)
                ->orWhere('referencia_viaje', $refToken)
                ->first();

            if ($enlaceEncontrado) {
                if ($enlaceEncontrado->accesos_count >= $enlaceEncontrado->max_usos) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Este enlace ha alcanzado el límite máximo de 3 respuestas permitidas. Por favor, comuníquese con Atención al Cliente para obtener un nuevo enlace.',
                    ], 403);
                }

                if ($enlaceEncontrado->referencia_viaje) {
                    $validated['referencia_viaje'] = $enlaceEncontrado->referencia_viaje;
                }
            }
        }

        $testimonio = TestimonioExperiencia::create($validated);

        if ($enlaceEncontrado) {
            $enlaceEncontrado->increment('accesos_count');
        }

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
