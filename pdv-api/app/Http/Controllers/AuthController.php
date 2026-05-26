<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Las credenciales proporcionadas son incorrectas.'
                ], 422);
            }

            // Limpiamos tokens viejos
            $user->tokens()->delete();

            // Generamos el token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Respuesta EXPLÍCITA para evitar que Laravel busque la columna 'id'
            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'user_ID' => $user->user_ID,
                    'name'    => $user->name,
                    'email'   => $user->email,
                    'role'    => (int) $user->role,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage() // Esto te dirá el error real en la consola
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user_ID' => $user->user_ID,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => (int) $user->role,
        ]);
    }
}