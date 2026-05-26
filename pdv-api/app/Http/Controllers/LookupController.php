<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\BoardType;
use App\Models\Country;
use App\Models\GuestType;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LookupController extends Controller
{
    private const CACHE_KEY = 'lookups.all';

    /**
     * Obtener todas las listas de búsqueda.
     */
    public function index()
    {
        $accommodations = Accommodation::with('post:post_ID,name')->get()
            ->map(fn($acc) => [
                'accommodation_ID' => $acc->accommodation_ID,
                'name'             => $acc->post->name ?? 'Unknown',
            ]);

        $data = [
            'countries'       => Country::all(),
            'guest_types'     => GuestType::all(),
            'board_types'     => BoardType::all(),
            'room_types'      => RoomType::all(),
            'blog_categories' => BlogCategory::all(),
            'blog_tags'       => BlogTag::all(),
            'accommodations'  => $accommodations,
        ];

        return response()->json($data);
    }

    /**
     * Métodos Store para creación dinámica desde React
     */

    public function storeBlogCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = BlogCategory::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($category, 201);
    }

    public function storeBlogTag(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $tag = BlogTag::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($tag, 201);
    }

    public function storeCountry(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $item = Country::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($item, 201);
    }

    public function storeGuestType(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $item = GuestType::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($item, 201);
    }

    public function storeBoardType(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $item = BoardType::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($item, 201);
    }

    public function storeRoomType(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $item = RoomType::create(['name' => $request->name]);
        $this->clearCache();
        return response()->json($item, 201);
    }

    private function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget('accommodations.all');
    }
}