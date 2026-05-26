<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida los datos necesarios para crear una consulta (inquiry).
 * Se usa tanto desde el formulario de detalle de producto como
 * desde el formulario de contacto general.
 */
class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'post_FK'      => 'nullable|exists:posts,post_ID',
            'client_name'  => 'required|string|max:255',
            'client_email' => 'required|email|max:255',
            'client_phone' => 'nullable|string|max:30',
            'from_date'    => 'nullable|date',
            'to_date'      => 'nullable|date|after_or_equal:from_date',
            'kids'         => 'nullable|boolean',
            'data'         => 'nullable|array',
        ];
    }

    /**
     * Mensajes de validación personalizados en español.
     */
    public function messages(): array
    {
        return [
            'client_name.required'  => 'El nombre del cliente es obligatorio.',
            'client_email.required' => 'El correo electrónico es obligatorio.',
            'client_email.email'    => 'El correo electrónico debe ser válido.',
            'to_date.after_or_equal'=> 'La fecha de salida debe ser posterior a la de llegada.',
            'post_FK.exists'        => 'El producto seleccionado no existe.',
        ];
    }
}
