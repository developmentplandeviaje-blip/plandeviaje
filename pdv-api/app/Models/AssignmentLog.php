<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentLog extends Model
{
    use HasFactory;

    protected $table = 'assignment_logs';

    protected $fillable = [
        'inquiry_id',
        'consultant_id',
        'status',
    ];

    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class, 'inquiry_id', 'inquiries_ID');
    }

    public function consultant()
    {
        return $this->belongsTo(Consultant::class, 'consultant_id', 'id');
    }
}
