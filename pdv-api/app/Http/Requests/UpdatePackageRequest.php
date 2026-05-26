<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para la actualización de un paquete turístico.
 */
class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'              => 'sometimes|string|max:255',
            'overview'          => 'sometimes|string',
            'information'       => 'nullable|string',
            'banner'            => 'nullable|string|max:500',
            'thumbnail'         => 'nullable|string|max:500',
            'images'            => 'nullable|array',
            'images.*'          => 'string|max:500',
            'starting_price'    => 'sometimes|numeric|min:0',
            'accommodation_FK'  => 'sometimes|exists:accommodation,accommodation_ID',
            'guest_type_FK'     => 'sometimes|exists:guest_types,guest_type_ID',
            'board_type_FK'     => 'sometimes|exists:board_types,board_type_ID',
            'features'          => 'nullable|array',
            'features.*.icon'   => 'required_with:features|string',
            'features.*.label'  => 'required_with:features|string',
            'days'              => 'nullable|string|max:100',
            'end_date'          => 'nullable|date',
            'isActive'          => 'boolean',
            'isFeatured'        => 'boolean',
        ];
    }
}
