<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlogPostRequest;
use App\Http\Requests\UpdateBlogPostRequest;
use App\Models\BlogPost;
use App\Traits\ManagesPostData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Gestión de publicaciones del blog.
 *
 * Maneja las operaciones CRUD de blog posts, incluyendo
 * categorías, etiquetas, imágenes y cacheo de consultas.
 */
class BlogPostController extends Controller
{
    use ManagesPostData;

    private const CACHE_KEY = 'blog_posts.all';
    private const CACHE_TTL = 300;

    /**
     * Listado de todas las publicaciones del blog (cacheado por 5 minutos).
     */
    public function index()
    {
        $blogPosts = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return BlogPost::with(['post.images', 'category', 'tags'])->get();
        });

        return response()->json($blogPosts);
    }

    /**
     * Registrar una nueva publicación del blog con su post, categoría y etiquetas.
     */
    public function store(StoreBlogPostRequest $request)
    {
        $blogPost = DB::transaction(function () use ($request) {
            $post = $this->createPost($request);

            if ($request->has('images')) {
                $this->syncImages($post->post_ID, $request->images);
            }

            $blog = BlogPost::create([
                'post_FK'          => $post->post_ID,
                'blog_category_FK' => $request->blog_category_FK,
            ]);

            if ($request->has('tags')) {
                $blog->tags()->sync($request->tags);
            }

            return $blog;
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json($blogPost, 201);
    }

    /**
     * Detalle de una publicación del blog con categoría e imágenes.
     */
    public function show(BlogPost $blogPost)
    {
        $blogPost->load(['post.images', 'category', 'tags']);

        return response()->json($blogPost);
    }

    /**
     * Actualizar una publicación del blog, su post y etiquetas.
     */
    public function update(UpdateBlogPostRequest $request, BlogPost $blogPost)
    {
        DB::transaction(function () use ($request, $blogPost) {
            $this->updatePost($blogPost->post, $request);

            $blogPost->update([
                'blog_category_FK' => $request->blog_category_FK,
            ]);

            if ($request->has('tags')) {
                $blogPost->tags()->sync($request->tags);
            }
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(
            $blogPost->fresh(['post.images', 'category', 'tags'])
        );
    }

    /**
     * Eliminar una publicación del blog, sus etiquetas y su post asociado.
     */
    public function destroy(BlogPost $blogPost)
    {
        DB::transaction(function () use ($blogPost) {
            $post = $blogPost->post;
            $blogPost->tags()->detach();
            $blogPost->delete();
            if ($post) {
                $this->deletePostWithImages($post);
            }
        });

        Cache::forget(self::CACHE_KEY);

        return response()->json(['message' => 'Publicación eliminada correctamente']);
    }
}
