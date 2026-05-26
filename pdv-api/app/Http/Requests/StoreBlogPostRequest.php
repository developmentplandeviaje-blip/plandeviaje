<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para la creación de una publicación de blog.
 */
class StoreBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => 'required|string|max:255',
            'overview'         => 'required|string',
            'information'      => 'nullable|string',
            'banner'           => 'nullable|string|max:500',
            'thumbnail'        => 'nullable|string|max:500',
            'images'           => 'nullable|array',
            'images.*'         => 'string|max:500',
            'blog_category_FK' => 'required|exists:blog_categories,blog_category_ID',
            'tags'             => 'nullable|array',
            'tags.*'           => 'exists:blog_tags,blog_tag_ID',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'El título de la publicación es obligatorio.',
            'overview.required'         => 'El resumen es obligatorio.',
            'blog_category_FK.required' => 'Debe seleccionar una categoría.',
            'blog_category_FK.exists'   => 'La categoría seleccionada no existe.',
        ];
    }
}
