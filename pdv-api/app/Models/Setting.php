<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasDynamicImageFields;

class Setting extends Model
{
    use HasDynamicImageFields;

    protected $fillable = ['key', 'value', 'type', 'group'];

    public function getValueAttribute($value)
    {
        if ($this->type === 'image') {
            return $this->formatImageUrl($value);
        }
        return $value;
    }

    public function setValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? $this->type ?? null;
        if ($type === 'image') {
            $this->attributes['value'] = $this->extractImageFilename($value);
        } else {
            $this->attributes['value'] = $value;
        }
    }
}