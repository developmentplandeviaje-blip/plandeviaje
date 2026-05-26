<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para la creación de un paquete turístico.
 */
class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'              => 'required|string|max:255',
            'overview'          => 'required|string',
            'information'       => 'nullable|string',
            'banner'            => 'nullable|string|max:500',
            'thumbnail'         => 'nullable|string|max:500',
            'images'            => 'nullable|array',
            'images.*'          => 'string|max:500',
            'starting_price'    => 'required|numeric|min:0',
            'accommodation_FK'  => 'required|exists:accommodation,accommodation_ID',
            'guest_type_FK'     => 'required|exists:guest_types,guest_type_ID',
            'board_type_FK'     => 'required|exists:board_types,board_type_ID',
            'features'          => 'nullable|array',
            'features.*.icon'   => 'required_with:features|string',
            'features.*.label'  => 'required_with:features|string',
            'days'              => 'nullable|string|max:100',
            'end_date'          => 'nullable|date',
            'isActive'          => 'boolean',
            'isFeatured'        => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'              => 'El nombre del paquete es obligatorio.',
            'overview.required'          => 'El resumen es obligatorio.',
            'starting_price.required'    => 'El precio inicial es obligatorio.',
            'accommodation_FK.required'  => 'Debe seleccionar un alojamiento.',
            'accommodation_FK.exists'    => 'El alojamiento seleccionado no existe.',
            'guest_type_FK.required'     => 'Debe seleccionar un tipo de huésped.',
            'board_type_FK.required'     => 'Debe seleccionar un tipo de pensión.',
        ];
    }
}
