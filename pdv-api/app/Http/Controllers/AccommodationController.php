<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccommodationRequest;
use App\Http\Requests\UpdateAccommodationRequest;
use App\Models\Accommodation;
use App\Traits\ManagesPostData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Exception;

/**
 * Gestión de alojamientos (hoteles).
 */
class AccommodationController extends Controller
{
    use ManagesPostData;

    private const CACHE_KEY = 'accommodations.all';
    private const CACHE_TTL = 300;

    /**
     * Listado de todos los alojamientos.
     */
    public function index(): JsonResponse
    {
        try {
            $accommodations = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
                return Accommodation::with(['post.images', 'roomTypes', 'boardType'])->get();
            });

            return response()->json($accommodations);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error al listar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Registrar un nuevo alojamiento.
     */
    public function store(StoreAccommodationRequest $request): JsonResponse
    {
        try {
            $accommodation = DB::transaction(function () use ($request) {
                // 1. Crear el post base usando el Trait
                $post = $this->createPost($request);

                // 2. Si hay imágenes, sincronizarlas
                if ($request->has('images')) {
                    $this->syncImages($post->post_ID, $request->images);
                }

                // 3. Crear el alojamiento vinculado al post_ID
                $newAccommodation = Accommodation::create([
                    'post_FK'        => $post->post_ID,
                    'destination'    => $request->destination,
                    'map_location'   => $request->map_location ?? '',
                    'starting_price' => $request->starting_price,
                    'stars'          => $request->stars ?? 0,
                    'features'       => $request->features, // El cast 'array' en el modelo lo convierte a JSON
                    'board_type_FK'  => $request->board_type_FK,
                    'isActive'       => $request->isActive ?? true,
                ]);

                // 4. Sincronizar tipos de habitación (Muchos a Muchos)
                if ($request->has('room_types')) {
                    $newAccommodation->roomTypes()->sync($request->room_types);
                }

                return $newAccommodation;
            });

            Cache::forget(self::CACHE_KEY);

            return response()->json($accommodation->load(['post.images', 'roomTypes', 'boardType']), 201);
            
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error al guardar el alojamiento',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Detalle de un alojamiento específico.
     */
    public function show(Accommodation $accommodation): JsonResponse
    {
        $accommodation->load(['post.images', 'roomTypes', 'boardType']);
        return response()->json($accommodation);
    }

    /**
     * Actualizar un alojamiento existente.
     */
    public function update(UpdateAccommodationRequest $request, Accommodation $accommodation): JsonResponse
    {
        try {
            DB::transaction(function () use ($request, $accommodation) {
                // Actualizar el post asociado (Trait)
                $this->updatePost($accommodation->post, $request);

                // Actualizar campos del alojamiento
                $accommodation->update(array_filter([
                    'destination'    => $request->input('destination', $accommodation->destination),
                    'map_location'   => $request->input('map_location', $accommodation->map_location),
                    'starting_price' => $request->input('starting_price', $accommodation->starting_price),
                    'stars'          => $request->input('stars', $accommodation->stars),
                    'features'       => $request->has('features') ? $request->features : $accommodation->features,
                    'board_type_FK'  => $request->input('board_type_FK', $accommodation->board_type_FK),
                    'isActive'       => $request->has('isActive') ? $request->isActive : $accommodation->isActive,
                ], fn($v) => $v !== null));

                // Sincronizar habitaciones si vienen en el request
                if ($request->has('room_types')) {
                    $accommodation->roomTypes()->sync($request->room_types);
                }
            });

            Cache::forget(self::CACHE_KEY);

            return response()->json(
                $accommodation->fresh(['post.images', 'boardType', 'roomTypes'])
            );
        } catch (Exception $e) {
            return response()->json(['error' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar un alojamiento.
     */
    public function destroy(Accommodation $accommodation): JsonResponse
    {
        try {
            DB::transaction(function () use ($accommodation) {
                $post = $accommodation->post;
                
                // Desvincular habitaciones de la tabla pivote
                $accommodation->roomTypes()->detach();
                
                // Eliminar el registro de alojamiento
                $accommodation->delete();
                
                // Eliminar el post y sus imágenes (Trait)
                if ($post) {
                    $this->deletePostWithImages($post);
                }
            });

            Cache::forget(self::CACHE_KEY);

            return response()->json(['message' => 'Alojamiento eliminado correctamente']);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error al eliminar: ' . $e->getMessage()], 500);
        }
    }
}