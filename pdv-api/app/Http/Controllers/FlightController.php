<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFlightRequest;
use App\Http\Requests\UpdateFlightRequest;
use App\Models\Flight;
use App\Traits\ManagesPostData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Gestión de vuelos.
 *
 * Maneja las operaciones CRUD de vuelos, incluyendo la creación
 * del post asociado, manejo de imágenes y cacheo de resultados.
 */
class FlightController extends Controller
{
    use ManagesPostData;

    private const CACHE_KEY = 'flights.all';
    private const CACHE_TTL = 300;

    /**
     * Listado de todos los vuelos (cacheado por 5 minutos).
     */
    public function index()
    {
        $flights = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Flight::with(['post.images', 'country'])->get();
        });

        return response()->json($flights);
    }

    /**
     * Registrar un nuevo vuelo con su post asociado.
     */
    public function store(StoreFlightRequest $request)
    {
        $flight = DB::transaction(function () use ($request) {
            $post = $this->createPost($request);

            if ($request->has('images')) {
                $this->syncImages($post->post_ID, $request->images);
            }

            return Flight::create([
                'post_FK'        => $post->post_ID,
                'destination'    => $request->destination,
                'country_FK'     => $request->country_FK,
                'map_location'   => $request->map_location ?? '',
                'features'       => $request->features ?? null,
                'requirements'   => $request->requirements ?? null,
                'starting_price' => $request->starting_price,
                'isActive'       => $request->isActive ?? true,
            ]);
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json($flight, 201);
    }

    /**
     * Detalle de un vuelo específico con sus relaciones.
     */
    public function show(Flight $flight)
    {
        $flight->load(['post.images', 'post.inquiries', 'country']);

        return response()->json($flight);
    }

    /**
     * Actualizar un vuelo existente y su post asociado.
     */
    public function update(UpdateFlightRequest $request, Flight $flight)
    {
        DB::transaction(function () use ($request, $flight) {
            $this->updatePost($flight->post, $request);

            $flight->update(array_filter([
                'destination'    => $request->input('destination', $flight->destination),
                'country_FK'    => $request->input('country_FK', $flight->country_FK),
                'map_location'  => $request->has('map_location') ? $request->map_location : $flight->map_location,
                'features'      => $request->has('features') ? $request->features : $flight->features,
                'requirements'  => $request->has('requirements') ? $request->requirements : $flight->requirements,
                'starting_price'=> $request->input('starting_price', $flight->starting_price),
                'isActive'      => $request->has('isActive') ? $request->isActive : $flight->isActive,
            ], fn($v) => $v !== null));
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(
            $flight->fresh(['post.images', 'country'])
        );
    }

    /**
     * Eliminar un vuelo y su post asociado.
     */
    public function destroy(Flight $flight)
    {
        DB::transaction(function () use ($flight) {
            $post = $flight->post;
            $flight->delete();
            if ($post) {
                $this->deletePostWithImages($post);
            }
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(['message' => 'Vuelo eliminado correctamente']);
    }
}
