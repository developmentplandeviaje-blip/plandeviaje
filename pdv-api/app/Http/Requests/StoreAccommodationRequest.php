<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccommodationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => 'required|string|max:255',
            'overview'        => 'required|string',
            'information'     => 'nullable|string',
            'banner'          => 'nullable|string|max:500',
            'thumbnail'       => 'nullable|string|max:500',
            'images'          => 'nullable|array',
            'destination'     => 'required|string|max:255',
            'map_location'    => 'nullable|string|max:500',
            'starting_price'  => 'required|numeric|min:0',
            'stars'           => 'required|integer|min:0|max:5',
            // Cambiamos a nullable por si el select manda vacío
            'board_type_FK'   => 'nullable', 
            'features'        => 'nullable|array',
            'room_types'      => 'nullable|array',
            'isActive'        => 'nullable', // Más flexible
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'El nombre es obligatorio.',
            'overview.required'       => 'El resumen es obligatorio.',
            'destination.required'    => 'El destino es obligatorio.',
            'starting_price.required' => 'El precio inicial es obligatorio.',
            'stars.required'          => 'Las estrellas son obligatorias.',
        ];
    }
}