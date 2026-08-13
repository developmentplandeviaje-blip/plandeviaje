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

                $localConsultant = Consultant::find($user->id);

                if ($localConsultant && $localConsultant->is_edited_manually) {
                    if (!$isActive) {
                        $localConsultant->update(['is_active' => false]);
                    }
                } else {
                    Consultant::updateOrCreate(
                        ['id' => $user->id],
                        [
                            'name'      => $fullName,
                            'phone'     => $phone,
                            'is_active' => $isActive,
                        ]
                    );
                }

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
        if ($request->has('id_asesor') && !empty($request->id_asesor)) {
            $consultant = Consultant::findOrFail($request->id_asesor);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'img' => 'nullable|string',
                'phone' => 'sometimes|string|max:50',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($request->has('img')) {
                $newImg = $request->img;
                $oldImg = $consultant->getRawOriginal('img');
                
                $newFilename = basename($newImg);
                $oldFilename = basename($oldImg);

                if ($newFilename !== $oldFilename && !empty($oldImg) && !preg_match('/^https?:\/\//i', $oldImg)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete('uploads/' . $oldImg);
                }
            }

            $validated['is_edited_manually'] = true;
            $consultant->update($validated);
            return response()->json($consultant, 200);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'img' => 'nullable|string',
            'phone' => 'required|string|max:50',
        ]);

        $validated['is_edited_manually'] = true;
        $validated['is_active'] = true;

        $consultant = Consultant::create($validated);
        return response()->json($consultant, 201);
    }

    public function revertToSync(Consultant $consultant)
    {
        try {
            $existsInCotizador = \Illuminate\Support\Facades\DB::connection('mysql_cotizador')
                ->table('user')
                ->where('id', $consultant->id)
                ->whereIn('level', ['Asesor', 'Lider'])
                ->exists();

            if (!$existsInCotizador) {
                $consultant->update([
                    'is_active' => false,
                    'is_edited_manually' => false,
                ]);
                return response()->json([
                    'success' => true,
                    'message' => 'El asesor no existe en el cotizador. Se ha inhabilitado y restablecido su sincronización automática.',
                    'consultant' => $consultant
                ], 200);
            }

            $cotizadorUser = \Illuminate\Support\Facades\DB::connection('mysql_cotizador')
                ->table('user')
                ->where('id', $consultant->id)
                ->first();

            $fullName = trim($cotizadorUser->first_name . ' ' . $cotizadorUser->last_name);
            $phone = !empty($cotizadorUser->telefono_1) ? $cotizadorUser->telefono_1 : (!empty($cotizadorUser->telefono_2) ? $cotizadorUser->telefono_2 : 'N/A');
            $isActive = ($cotizadorUser->status == 1);

            $consultant->update([
                'name' => $fullName,
                'phone' => $phone,
                'is_active' => $isActive,
                'is_edited_manually' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sincronización automática restablecida y datos actualizados.',
                'consultant' => $consultant
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al revertir sincronización: ' . $e->getMessage()
            ], 500);
        }
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
            'is_active' => 'sometimes|boolean',
        ]);

        $validated['is_edited_manually'] = true;

        $consultant->update($validated);
        return response()->json($consultant, 200);
    }

    public function destroy(Consultant $consultant)
    {
        $consultant->delete();
        return response()->json(null, 204);
    }
}
