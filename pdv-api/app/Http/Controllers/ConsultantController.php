<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use Illuminate\Http\Request;

class ConsultantController extends Controller
{
    public function index(Request $request)
    {
        $query = Consultant::query();
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }
        return response()->json($query->get(), 200);
    }

    public function sync()
    {
        try {
            $localIds = Consultant::pluck('id')->toArray();
            $processedIds = [];

            $cotizadorUsers = \Illuminate\Support\Facades\DB::connection('mysql_cotizador')
                ->table('user')
                ->whereIn('level', ['Asesor', 'Lider'])
                ->get();

            foreach ($cotizadorUsers as $user) {
                $fullName = trim($user->first_name . ' ' . $user->last_name);
                $phone = !empty($user->telefono_1) ? $user->telefono_1 : (!empty($user->telefono_2) ? $user->telefono_2 : 'N/A');
                $isActive = ($user->status == 1);

                Consultant::updateOrCreate(
                    ['id' => $user->id],
                    [
                        'name'      => $fullName,
                        'phone'     => $phone,
                        'is_active' => $isActive,
                    ]
                );

                $processedIds[] = $user->id;
            }

            $deletedIds = array_diff($localIds, $processedIds);
            if (!empty($deletedIds)) {
                Consultant::whereIn('id', $deletedIds)->update(['is_active' => false]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sincronización completada exitosamente.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error durante la sincronización: ' . $e->getMessage()
            ], 500);
        }
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
