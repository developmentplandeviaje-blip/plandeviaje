<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para la actualización de una publicación de blog.
 */
class UpdateBlogPostRequest extends FormRequest
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
}
