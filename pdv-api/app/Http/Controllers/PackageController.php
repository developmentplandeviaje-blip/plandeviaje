<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePackageRequest;
use App\Http\Requests\UpdatePackageRequest;
use App\Models\Package;
use App\Traits\ManagesPostData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

/**
 * Gestión de paquetes turísticos para Plan de Viaje.
 * Maneja tres estados: Editar (Update), Archivar (isActive) y Eliminar (Destroy).
 */
class PackageController extends Controller
{
    use ManagesPostData;

    private const CACHE_KEY = 'packages.all';
    private const CACHE_TTL = 300; // 5 minutos

    /**
     * Listado de paquetes.
     * He añadido un soporte de filtro:
     * 1. Si se llama normalmente, trae TODO (para el Dashboard).
     * 2. Si se llama con ?public=1, trae solo los ACTIVOS (para la web).
     */
    public function index(Request $request)
    {
        // Si es para la web pública, filtramos. Si no, traemos todo para el admin.
        $isPublic = $request->query('public');

        $packages = Package::with([
                'post.images', 
                'accommodation.post', 
                'guestType', 
                'boardType'
            ])
            ->select('packages.*')
            ->when($isPublic, function ($query) {
                return $query->where('isActive', 1);
            })
            ->get()
            // El unique previene duplicados si hay inconsistencia en los joins de la BD
            ->unique('packages_ID') 
            ->values();

        return response()->json($packages);
    }

    /**
     * Registrar un nuevo paquete turístico.
     */
    public function store(StorePackageRequest $request)
    {
        $package = DB::transaction(function () use ($request) {
            $post = $this->createPost($request);

            if ($request->has('images')) {
                $this->syncImages($post->post_ID, $request->images);
            }

            return Package::create([
                'post_FK'          => $post->post_ID,
                'accommodation_FK' => $request->accommodation_FK,
                'features'         => $request->features ?? null,
                'starting_price'   => $request->starting_price,
                'days'             => $request->days ?? '',
                'guest_type_FK'    => $request->guest_type_FK,
                'board_type_FK'    => $request->board_type_FK,
                'isActive'         => $request->isActive ?? true,
                'isFeatured'       => $request->isFeatured ?? false,
                'end_date'         => $request->end_date ?? now()->addMonths(6),
            ]);
        });

        Cache::forget(self::CACHE_KEY);
        return response()->json($package->load(['post.images', 'accommodation.post']), 201);
    }

    /**
     * Detalle de un paquete.
     */
    public function show(Package $package)
    {
        $package->load([
            'post.images', 
            'post.inquiries', 
            'accommodation.post', 
            'guestType', 
            'boardType'
        ]);

        return response()->json($package);
    }

    /**
     * Actualizar un paquete existente.
     */
    public function update(UpdatePackageRequest $request, Package $package)
    {
        DB::transaction(function () use ($request, $package) {
            if ($package->post) {
                $this->updatePost($package->post, $request);
            }

            if ($request->has('images')) {
                $this->syncImages($package->post->post_ID, $request->images);
            }

            // Actualización de campos del paquete
            $package->update(array_filter([
                'accommodation_FK' => $request->input('accommodation_FK', $package->accommodation_FK),
                'features'         => $request->has('features') ? $request->features : $package->features,
                'starting_price'   => $request->input('starting_price', $package->starting_price),
                'days'             => $request->has('days') ? $request->days : $package->days,
                'guest_type_FK'    => $request->input('guest_type_FK', $package->guest_type_FK),
                'board_type_FK'    => $request->input('board_type_FK', $package->board_type_FK),
                'isActive'         => $request->has('isActive') ? $request->isActive : $package->isActive,
                'isFeatured'       => $request->has('isFeatured') ? $request->isFeatured : $package->isFeatured,
                'end_date'         => $request->has('end_date') ? $request->end_date : $package->end_date,
            ], fn($v) => $v !== null));
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(
            $package->fresh(['post.images', 'accommodation.post', 'guestType', 'boardType'])
        );
    }

    /**
     * Alternar estado Activo/Inactivo (Archivar).
     * Este método es el que usará el botón "Archivar/Activar" de tu tabla.
     */
    public function toggleStatus(Package $package)
    {
        $package->isActive = !$package->isActive;
        $package->save();

        Cache::forget(self::CACHE_KEY);

        return response()->json([
            'message' => $package->isActive ? 'Paquete activado' : 'Paquete archivado',
            'isActive' => $package->isActive
        ]);
    }

    /**
     * ELIMINAR un paquete definitivamente.
     * Este método se activa con el botón "Eliminar" de color rojo.
     */
    public function destroy(Package $package)
    {
        DB::transaction(function () use ($package) {
            $post = $package->post;
            
            // 1. Borramos el paquete
            $package->delete();
            
            // 2. Borramos el post y sus imágenes asociadas (vía Trait)
            if ($post) {
                $this->deletePostWithImages($post);
            }
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(['message' => 'Paquete y contenido asociado eliminados definitivamente']);
    }
}