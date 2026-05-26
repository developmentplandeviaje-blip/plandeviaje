<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Gestión de carga de archivos.
 *
 * Permite subir imágenes al almacenamiento público del servidor
 * y devuelve la URL resultante para ser utilizada en los formularios.
 */
class UploadController extends Controller
{
    /**
     * Subir una imagen al servidor.
     *
     * Acepta formatos JPEG, PNG, GIF y WebP con un tamaño máximo de 5MB.
     * El archivo se almacena en storage/app/public/uploads con un nombre único.
     */
    public function storeImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('uploads', $filename, 'public');

            return response()->json([
                'url' => Storage::url($path),
                'message' => 'Imagen subida correctamente'
            ], 200);
        }

        return response()->json(['message' => 'No se proporcionó ninguna imagen'], 400);
    }
}
