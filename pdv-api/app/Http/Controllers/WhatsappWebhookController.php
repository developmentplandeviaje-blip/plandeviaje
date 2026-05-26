<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Consultant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappWebhookController extends Controller
{
    /**
     * Handle incoming webhook requests from the Node.js Baileys service.
     */
    public function handle(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'nullable|string',
            'inquiry_id' => 'required|integer',
            'response' => 'required|string',
        ]);

        $inquiryId = $validated['inquiry_id'];
        $response = trim($validated['response']);

        $inquiry = Inquiry::with('consultant')->find($inquiryId);

        if (!$inquiry) {
            Log::error("Received WhatsApp webhook but no inquiry found for ID: {$inquiryId}");
            return response()->json(['success' => false, 'message' => 'Inquiry not found'], 404);
        }

        // Only process if it's currently waiting for an answer
        if ($inquiry->assignment_status !== 'esperando respuesta') {
            Log::info("Inquiry #{$inquiryId} is no longer pending (current status: {$inquiry->assignment_status})");
            // Still return 200 so Node.js knows it was received, just ignore it.
            return response()->json(['success' => true, 'message' => 'Inquiry already processed']);
        }

        $consultantName = $inquiry->consultant ? $inquiry->consultant->name : 'Unknown';

        if ($response === '1') {
            // Aceptado
            $inquiry->assignment_status = 'en contacto';
            $inquiry->save();
            Log::info("Inquiry #{$inquiryId} accepted by consultant {$consultantName}");
        } elseif ($response === '2') {
            // Rechazado - Unassign so it goes back to 'pending' pool
            $inquiry->consultant_id = null;
            $inquiry->assigned_at = null;
            $inquiry->assignment_status = 'pending'; // Returns to queue
            $inquiry->save();
            Log::info("Inquiry #{$inquiryId} rejected by consultant {$consultantName} and returned to pool");
        } else {
            Log::warning("Invalid response '{$response}' for inquiry #{$inquiryId}");
            return response()->json(['success' => false, 'message' => 'Invalid response code'], 400);
        }

        return response()->json(['success' => true]);
    }
}
