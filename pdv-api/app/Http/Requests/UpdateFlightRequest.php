<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Usamos 'sometimes' para que solo valide si el campo está presente
            'name'            => 'sometimes|required|string|max:255',
            'overview'        => 'sometimes|required|string',
            'information'     => 'nullable|string',
            'banner'          => 'nullable|string|max:500',
            'thumbnail'       => 'nullable|string|max:500',
            'images'          => 'nullable|array',
            'images.*'        => 'string|max:500',

            'destination'     => 'sometimes|required|string|max:255',
            'country_FK'      => 'sometimes|required|integer|exists:countries,country_ID',
            'map_location'    => 'nullable|string|max:500',
            'features'        => 'nullable|array',
            'features.*'      => 'array',
            'requirements'    => 'nullable|array',
            'requirements.*'  => 'string',
            'starting_price'  => 'sometimes|required|numeric|min:0',
            'isActive'        => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'El nombre no puede quedar vacío.',
            'country_FK.exists'       => 'El país seleccionado no existe en nuestros registros.',
            'starting_price.numeric'  => 'El precio debe ser un formato numérico.',
        ];
    }
}