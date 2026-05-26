<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para la actualización de un alojamiento.
 */
class UpdateAccommodationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => 'sometimes|string|max:255',
            'overview'        => 'sometimes|string',
            'information'     => 'nullable|string',
            'banner'          => 'nullable|string|max:500',
            'thumbnail'       => 'nullable|string|max:500',
            'images'          => 'nullable|array',
            'images.*'        => 'string|max:500',
            'destination'     => 'sometimes|string|max:255',
            'map_location'    => 'nullable|string|max:500',
            'starting_price'  => 'sometimes|numeric|min:0',
            'stars'           => 'sometimes|integer|min:1|max:5',
            'board_type_FK'   => 'nullable|exists:board_types,board_type_ID',
            'features'        => 'nullable|array',
            'features.*.icon' => 'required_with:features|string',
            'features.*.label'=> 'required_with:features|string',
            'room_types'      => 'nullable|array',
            'room_types.*'    => 'exists:room_types,room_type_ID',
            'isActive'        => 'boolean',
        ];
    }
}
