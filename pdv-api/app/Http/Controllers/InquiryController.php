<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Gestión de consultas (inquiries) de clientes.
 *
 * Permite a visitantes del sitio crear consultas públicas, y a los
 * administradores asignar asesores que reciben notificación por WhatsApp.
 */
class InquiryController extends Controller
{
    /**
     * Listado de todas las consultas ordenadas por las más recientes.
     */
    public function index()
    {
        $inquiries = Inquiry::with(['post', 'consultant'])
            ->orderByDesc('inquiries_ID')
            ->get();

        return response()->json($inquiries);
    }

    /**
     * Crear una nueva consulta desde el formulario público.
     * Se puede crear desde el detalle de un producto (con post_FK)
     * o desde la página de contacto general (sin post_FK).
     */
    public function store(StoreInquiryRequest $request)
    {
        $validated = $request->validated();
        $validated['status'] = true;
        $validated['assignment_status'] = 'pending';
        $validated['kids'] = $request->boolean('kids');

        $inquiry = Inquiry::create($validated);

        return response()->json($inquiry, 201);
    }

    /**
     * Detalle de una consulta específica.
     */
    public function show(Inquiry $inquiry)
    {
        $inquiry->load(['post', 'consultant', 'guestType']);

        return response()->json($inquiry);
    }

    /**
     * Asignar un asesor a una consulta.
     * Envía automáticamente un mensaje de WhatsApp al asesor
     * a través del microservicio Node.js.
     */
    public function assignConsultant(Request $request, Inquiry $inquiry)
    {
        $validated = $request->validate([
            'consultant_id' => 'required|exists:consultants,id',
        ]);

        $inquiry->consultant_id = $validated['consultant_id'];
        $inquiry->assignment_status = 'esperando respuesta';
        $inquiry->assigned_at = now();
        $inquiry->save();

        $inquiry->load('consultant');

        // Notificar al asesor vía microservicio de WhatsApp
        try {
            $cleanClientPhone = preg_replace('/[^0-9]/', '', $inquiry->client_phone);
            $formattedMessage = "Nueva consulta de {$inquiry->client_name}.\n\nTeléfono: https://wa.me/{$cleanClientPhone}\nEmail: {$inquiry->client_email}\nLlegada: " . ($inquiry->from_date ? $inquiry->from_date->format('d/m/Y') : 'N/A');

            Http::timeout(5)->post('http://localhost:3001/send', [
                'phone'      => $inquiry->consultant->phone,
                'message'    => $formattedMessage,
                'inquiry_id' => $inquiry->inquiries_ID,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al notificar al microservicio WhatsApp: ' . $e->getMessage());
        }

        return response()->json($inquiry);
    }

    /**
     * Eliminar una consulta.
     */
    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();

        return response()->json(null, 204);
    }
}
