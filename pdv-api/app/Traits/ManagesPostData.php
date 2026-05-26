<?php

namespace App\Traits;

use App\Models\Image;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Lógica compartida entre los controllers de contenido.
 *
 * Centraliza las operaciones comunes de creación, actualización y eliminación
 * de Posts y sus imágenes asociadas. Utilizado por FlightController,
 * AccommodationController, PackageController y BlogPostController.
 */
trait ManagesPostData
{
    /**
     * Crear un nuevo registro en la tabla posts con los campos comunes.
     */
    protected function createPost(Request $request): Post
    {
        return Post::create([
            'name'        => $request->name,
            'overview'    => $request->overview,
            'information' => $request->information ?? '',
            'banner'      => $request->banner ?? '',
            'thumbnail'   => $request->thumbnail ?? '',
            'createdBy'   => auth()->id(),
            'updatedBy'   => auth()->id(),
        ]);
    }

    /**
     * Sincronizar la galería de imágenes de un post.
     * Elimina las imágenes actuales y crea las nuevas.
     */
    protected function syncImages(int $postId, ?array $images): void
    {
        Image::where('post_FK', $postId)->delete();

        if (empty($images)) {
            return;
        }

        $records = [];
        foreach ($images as $url) {
            if (!empty($url)) {
                $records[] = ['post_FK' => $postId, 'url' => $url];
            }
        }

        if (!empty($records)) {
            Image::insert($records);
        }
    }

    /**
     * Actualizar los campos comunes de un post existente.
     */
    protected function updatePost(Post $post, Request $request): void
    {
        $post->update([
            'name'        => $request->input('name', $post->name),
            'overview'    => $request->input('overview', $post->overview),
            'information' => $request->has('information') ? $request->information : $post->information,
            'banner'      => $request->has('banner') ? $request->banner : $post->banner,
            'thumbnail'   => $request->has('thumbnail') ? $request->thumbnail : $post->thumbnail,
            'updatedBy'   => auth()->id(),
        ]);

        if ($request->has('images')) {
            $this->syncImages($post->post_ID, $request->images);
        }
    }

    /**
     * Eliminar un post junto con todas sus imágenes de galería.
     */
    protected function deletePostWithImages(Post $post): void
    {
        Image::where('post_FK', $post->post_ID)->delete();
        $post->delete();
    }
}
