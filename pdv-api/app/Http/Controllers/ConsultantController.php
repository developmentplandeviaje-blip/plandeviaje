<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use Illuminate\Http\Request;

class ConsultantController extends Controller
{
    public function index()
    {
        return response()->json(Consultant::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'img' => 'nullable|string',
            'phone' => 'required|string|max:50',
        ]);

        $consultant = Consultant::create($validated);
        return response()->json($consultant, 201);
    }

    public function show(Consultant $consultant)
    {
        return response()->json($consultant, 200);
    }

    public function update(Request $request, Consultant $consultant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'img' => 'nullable|string',
            'phone' => 'sometimes|string|max:50',
        ]);

        $consultant->update($validated);
        return response()->json($consultant, 200);
    }

    public function destroy(Consultant $consultant)
    {
        $consultant->delete();
        return response()->json(null, 204);
    }
}
