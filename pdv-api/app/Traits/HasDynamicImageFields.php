<?php

namespace App\Traits;

trait HasDynamicImageFields
{
    /**
     * Normalizes and extracts only the filename of the image, discarding any local storage paths.
     * Keeps external URLs intact.
     */
    protected function extractImageFilename($value)
    {
        if (empty($value)) {
            return $value;
        }

        // If it's a full URL, check if it's our own local/production storage URL
        if (preg_match('/^https?:\/\//i', $value)) {
            $cleaned = preg_replace('/^https?:\/\/[^\/]+/', '', $value);
            if (preg_match('/^\/?storage\/uploads\/(.+)$/i', $cleaned, $matches)) {
                return $matches[1];
            }
            return $value;
        }

        // If it contains the local storage path
        if (preg_match('/^\/?storage\/uploads\/(.+)$/i', $value, $matches)) {
            return $matches[1];
        }

        // Fallback if there is a slash
        if (str_contains($value, '/')) {
            return basename($value);
        }

        return $value;
    }

    /**
     * Appends the dynamic path to the filename stored in the database.
     * Keeps external URLs intact.
     */
    protected function formatImageUrl($value)
    {
        if (empty($value)) {
            return $value;
        }

        // If it's an external URL or data URI, return as-is
        if (preg_match('/^(https?:\/\/|data:)/i', $value)) {
            return $value;
        }

        // If it already has storage path, return normalized
        if (preg_match('/^\/?storage\//i', $value)) {
            return '/' . ltrim($value, '/');
        }

        // Otherwise, append /storage/uploads/
        return '/storage/uploads/' . ltrim($value, '/');
    }
}
