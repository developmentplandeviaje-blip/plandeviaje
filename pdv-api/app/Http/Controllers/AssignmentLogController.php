<?php

namespace App\Http\Controllers;

use App\Models\AssignmentLog;
use Illuminate\Http\Request;

class AssignmentLogController extends Controller
{
    /**
     * Display a listing of the assignment logs with search, sorting, and pagination.
     */
    public function index(Request $request)
    {
        $query = AssignmentLog::query()
            ->join('consultants', 'assignment_logs.consultant_id', '=', 'consultants.id')
            ->join('inquiries', 'assignment_logs.inquiry_id', '=', 'inquiries.inquiries_ID')
            ->select([
                'assignment_logs.id',
                'assignment_logs.status',
                'assignment_logs.created_at',
                'consultants.name as consultant_name',
                'inquiries.client_name as client_name',
            ]);

        // reactive search/filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('consultants.name', 'like', "%{$search}%")
                  ->orWhere('inquiries.client_name', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('sort_order', 'desc');

        // Whitelist sorting parameters
        if ($sortBy === 'consultant_name') {
            $query->orderBy('consultants.name', $sortOrder);
        } elseif ($sortBy === 'client_name') {
            $query->orderBy('inquiries.client_name', $sortOrder);
        } elseif ($sortBy === 'status') {
            $query->orderBy('assignment_logs.status', $sortOrder);
        } else {
            $query->orderBy('assignment_logs.id', $sortOrder);
        }

        $logs = $query->paginate(10);

        return response()->json($logs);
    }
}
