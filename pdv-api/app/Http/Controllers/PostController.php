<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with(['flight', 'accommodation', 'package', 'blogPost', 'images'])->get();
        return response()->json($posts);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $post = Post::with(['flight.country', 'accommodation.guestType', 'accommodation.boardType', 'package', 'blogPost.category', 'images', 'inquiries'])->find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($post);
    }
}
