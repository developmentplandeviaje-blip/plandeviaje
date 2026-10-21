<?php

namespace App\Http\Controllers;

use App\Models\LegalidadVigencia;
use App\Models\LegalidadImagen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LegalidadVigenciaController extends Controller
{
    /**
     * Obtiene o crea el registro principal de Legalidad y Vigencia.
     */
    private function getOrCreateRecord(): LegalidadVigencia
    {
        $record = LegalidadVigencia::first();

        if (!$record) {
            $defaultToken = 'somos-plan-de-viaje-' . strtolower(Str::random(6));
            $defaultTexto = "Plan de Viaje Nació en la isla de Margarita, con el firme propósito de impulsar sus lugares más asombrosos, hoteles confortables y playas increíbles que lo convierte en el destino turístico principal de los venezolanos, sin dejar a un lado otros increíbles destinos del país.\n\nNuestra agencia de Viaje se ha encargado por más de 10 años en planificar y crear experiencias para el disfrute de nuestros viajeros a través de servicios de traslados, paquetería turística, boletería aérea y de ferry.";

            $record = LegalidadVigencia::create([
                'token'     => $defaultToken,
                'titulo'    => '¡SOMOS PLAN DE VIAJE, MÁS QUE VIAJAR!',
                'texto'     => $defaultTexto,
                'url_video' => null,
            ]);
        }

        return $record;
    }

    /**
     * Obtiene la información para el panel de administración.
     */
    public function getAdmin()
    {
        $record = $this->getOrCreateRecord();
        $record->load(['imagenes' => function ($q) {
            $q->orderBy('orden', 'asc');
        }]);

        return response()->json([
            'success' => true,
            'data'    => $record,
        ]);
    }

    /**
     * Actualiza el contenido (título, texto informativo y URL de video).
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'titulo'        => 'required|string|max:255',
            'texto'         => 'nullable|string',
            'url_video'     => 'nullable|string|max:1000',
            'portada_video' => 'nullable|string|max:1000',
        ]);

        $record = $this->getOrCreateRecord();
        $record->update($validated);
        $record->load(['imagenes' => function ($q) {
            $q->orderBy('orden', 'asc');
        }]);

        return response()->json([
            'success' => true,
            'message' => 'Contenido de Legalidad y Vigencia actualizado correctamente',
            'data'    => $record,
        ]);
    }

    /**
     * Regenera el token único para compartir la vista.
     */
    public function regenerateToken()
    {
        $record = $this->getOrCreateRecord();
        $newToken = 'leg_' . strtolower(Str::random(12));

        $record->update([
            'token' => $newToken,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nuevo enlace generado exitosamente',
            'token'   => $newToken,
        ]);
    }

    /**
     * Subida múltiple de imágenes para el carrusel.
     */
    public function uploadImages(Request $request)
    {
        $request->validate([
            'images'   => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        $record = $this->getOrCreateRecord();
        $currentMaxOrden = LegalidadImagen::where('legalidad_id', $record->id)->max('orden') ?? -1;

        $createdImages = [];

        foreach ($request->file('images') as $file) {
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads/legalidad', $filename, 'public');
            $fullUrl = Storage::url($path);

            $currentMaxOrden++;
            $imagen = LegalidadImagen::create([
                'legalidad_id' => $record->id,
                'ruta_imagen'  => $fullUrl,
                'orden'        => $currentMaxOrden,
            ]);

            $createdImages[] = $imagen;
        }

        $allImages = LegalidadImagen::where('legalidad_id', $record->id)
            ->orderBy('orden', 'asc')
            ->get();

        return response()->json([
            'success'  => true,
            'message'  => count($createdImages) . ' imagen(es) agregada(s) al carrusel',
            'imagenes' => $allImages,
        ]);
    }

    /**
     * Actualiza el orden dinámico de las imágenes del carrusel.
     */
    public function updateImagesOrder(Request $request)
    {
        $validated = $request->validate([
            'ordered_ids'   => 'required|array',
            'ordered_ids.*' => 'integer',
        ]);

        $record = $this->getOrCreateRecord();

        foreach ($validated['ordered_ids'] as $index => $id) {
            LegalidadImagen::where('legalidad_id', $record->id)
                ->where('id', $id)
                ->update(['orden' => $index]);
        }

        $allImages = LegalidadImagen::where('legalidad_id', $record->id)
            ->orderBy('orden', 'asc')
            ->get();

        return response()->json([
            'success'  => true,
            'message'  => 'Orden del carrusel actualizado correctamente',
            'imagenes' => $allImages,
        ]);
    }

    /**
     * Elimina una imagen del carrusel.
     */
    public function deleteImage($id)
    {
        $imagen = LegalidadImagen::findOrFail($id);
        $legalidadId = $imagen->legalidad_id;

        // Intentar eliminar del storage si es local
        if ($imagen->ruta_imagen && Str::contains($imagen->ruta_imagen, '/storage/uploads/legalidad/')) {
            $relativePath = Str::after($imagen->ruta_imagen, '/storage/');
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $imagen->delete();

        // Reindexar el orden
        $remaining = LegalidadImagen::where('legalidad_id', $legalidadId)
            ->orderBy('orden', 'asc')
            ->get();

        foreach ($remaining as $index => $item) {
            $item->update(['orden' => $index]);
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Imagen eliminada correctamente del carrusel',
            'imagenes' => $remaining,
        ]);
    }

    /**
     * Subida de archivo de video (hasta 250MB).
     */
    public function uploadVideo(Request $request)
    {
        ini_set('max_execution_time', '300');
        ini_set('memory_limit', '512M');

        $request->validate([
            'video' => [
                'required',
                'file',
                'max:256000', // 250MB
                function ($attribute, $value, $fail) {
                    $allowedExts = ['mp4', 'mov', 'webm', 'ogg', 'avi', 'mkv', 'm4v', '3gp', 'flv'];
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (!in_array($ext, $allowedExts)) {
                        $fail('El formato de video debe ser compatible (.mp4, .mov, .webm, .ogg, .avi, .mkv).');
                    }
                },
            ],
        ]);

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $extension = $file->getClientOriginalExtension() ?: 'mp4';
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            $path = $file->storeAs('uploads/legalidad_videos', $filename, 'public');

            $fullUrl = Storage::url($path);

            // Actualizar directamente en el registro
            $record = $this->getOrCreateRecord();
            $record->update(['url_video' => $fullUrl]);

            return response()->json([
                'success' => true,
                'message' => 'Video subido correctamente',
                'url'     => $fullUrl,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No se proporcionó ningún archivo de video',
        ], 400);
    }

    /**
     * Subida de imagen de portada (poster/thumbnail) para el video.
     */
    public function uploadPortadaVideo(Request $request)
    {
        $request->validate([
            'portada' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('portada')) {
            $file = $request->file('portada');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads/legalidad_portadas', $filename, 'public');
            $fullUrl = Storage::url($path);

            $record = $this->getOrCreateRecord();
            $record->update(['portada_video' => $fullUrl]);

            return response()->json([
                'success' => true,
                'message' => 'Imagen de portada actualizada correctamente',
                'url'     => $fullUrl,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No se proporcionó ningún archivo de imagen',
        ], 400);
    }

    /**
     * Elimina la imagen de portada del video.
     */
    public function deletePortadaVideo()
    {
        $record = $this->getOrCreateRecord();
        $record->update(['portada_video' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Imagen de portada eliminada correctamente',
        ]);
    }

    /**
     * Endpoint público para la vista restringida con token.
     */
    public function getPublic($token)
    {
        if (empty($token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token no provisto',
            ], 400);
        }

        $record = LegalidadVigencia::where('token', $token)
            ->with(['imagenes' => function ($q) {
                $q->orderBy('orden', 'asc');
            }])
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso restringido: Enlace no válido o expirado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $record,
        ]);
    }
}
