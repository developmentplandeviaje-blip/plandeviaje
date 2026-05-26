<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    use HasFactory;

    protected $table = 'inquiries';
    protected $primaryKey = 'inquiries_ID';
    public $timestamps = false;

    protected $fillable = [
        'post_FK',
        'client_name',
        'client_email',
        'client_phone',
        'guest_type_FK',
        'kids',
        'from_date',
        'to_date',
        'status',
        'consultant_id',
        'assignment_status',
        'assigned_at',
        'data',
    ];

    protected $casts = [
        'kids' => 'boolean',
        'status' => 'boolean',
        'from_date' => 'datetime',
        'to_date' => 'datetime',
        'assigned_at' => 'datetime',
        'data' => 'array',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_FK', 'post_ID');
    }

    public function guestType()
    {
        return $this->belongsTo(GuestType::class, 'guest_type_FK', 'guest_type_ID');
    }

    public function consultant()
    {
        return $this->belongsTo(Consultant::class, 'consultant_id', 'id');
    }
}
