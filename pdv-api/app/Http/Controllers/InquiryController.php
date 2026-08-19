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
        try {
            $validated = $request->validated();
            $validated['status'] = true;
            $validated['assignment_status'] = 'pending';
            $validated['kids'] = $request->boolean('kids');

            // Formatear fechas si vienen presentes, o asignar null
            if (!empty($validated['from_date'])) {
                $validated['from_date'] = date('Y-m-d H:i:s', strtotime($validated['from_date']));
            } else {
                $validated['from_date'] = null;
            }

            if (!empty($validated['to_date'])) {
                $validated['to_date'] = date('Y-m-d H:i:s', strtotime($validated['to_date']));
            } else {
                $validated['to_date'] = null;
            }

            $inquiry = Inquiry::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Consulta registrada exitosamente.',
                'data'    => $inquiry,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Error al registrar consulta en InquiryController@store: ' . $e->getMessage(), [
                'exception' => $e,
                'payload'   => $request->all(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al procesar la consulta en el servidor.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Error interno del servidor.',
            ], 500);
        }
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

        // Cargar todas las relaciones necesarias para el detalle ampliado
        $inquiry->load(['post.flight', 'post.accommodation', 'post.package', 'consultant', 'guestType']);

        // Notificar al asesor vía microservicio de WhatsApp
        try {
            $cleanClientPhone = preg_replace('/[^0-9]/', '', $inquiry->client_phone);
            
            // Determinar tipo de consulta y detalles del producto
            $tipoConsulta = "General / Contacto";
            $productDetails = "";
            $productUrl = "";
            $priceText = "";

            if ($inquiry->post) {
                $post = $inquiry->post;
                $frontendBase = rtrim(env('FRONTEND_URL', 'https://plandeviaje.com.ve'), '/');

                if ($post->package) {
                    $tipoConsulta = "Paquete Turístico";
                    $price = $post->package->starting_price;
                    $priceText = $price ? "$" . number_format($price, 2) : "N/A";
                    $productDetails = "\n📦 *Paquete:* {$post->name}\n💵 *Precio desde:* {$priceText}";
                    
                    // AUDIT FIX: Use specific packages_ID primary key instead of post_ID
                    $packageId = $post->package->packages_ID ?? $post->post_ID;
                    $productUrl = "\n🔗 *Enlace al producto:* {$frontendBase}/package/{$packageId}";
                } elseif ($post->accommodation) {
                    $tipoConsulta = "Hospedaje / Alojamiento";
                    $price = $post->accommodation->starting_price;
                    $priceText = $price ? "$" . number_format($price, 2) : "N/A";
                    $productDetails = "\n🏨 *Hotel/Hospedaje:* {$post->name}\n💵 *Precio desde:* {$priceText}";
                    
                    // AUDIT FIX: Use specific accommodation_ID primary key instead of post_ID
                    $accommodationId = $post->accommodation->accommodation_ID ?? $post->post_ID;
                    $productUrl = "\n🔗 *Enlace al producto:* {$frontendBase}/hotel/{$accommodationId}";
                } elseif ($post->flight) {
                    $tipoConsulta = "Boletaría / Vuelo";
                    $price = $post->flight->starting_price;
                    $priceText = $price ? "$" . number_format($price, 2) : "N/A";
                    $productDetails = "\n✈️ *Vuelo:* {$post->name}\n💵 *Precio desde:* {$priceText}";
                    
                    // AUDIT FIX: Use specific flights_ID primary key instead of post_ID
                    $flightId = $post->flight->flights_ID ?? $post->post_ID;
                    $productUrl = "\n🔗 *Enlace al producto:* {$frontendBase}/vuelo/{$flightId}";
                }
            }

            // Datos de huéspedes
            $adults = isset($inquiry->data['guests']) ? (int)$inquiry->data['guests'] : 1;
            $kidsCount = isset($inquiry->data['kidsCount']) ? (int)$inquiry->data['kidsCount'] : 0;
            $tipoHuesped = $inquiry->guestType ? $inquiry->guestType->name : 'N/A';

            $huespedesDetails = "\n👥 *Huéspedes:* {$tipoHuesped} (Adultos: {$adults} | Niños: " . ($inquiry->kids ? ($kidsCount > 0 ? $kidsCount : 'Sí') : 'No') . ")";

            // Fechas
            $fechasDetails = "";
            if ($inquiry->from_date) {
                $fechasDetails = "\n📅 *Llegada:* " . $inquiry->from_date->format('d/m/Y');
                if ($inquiry->to_date) {
                    $fechasDetails .= " | *Salida:* " . $inquiry->to_date->format('d/m/Y');
                }
            }

            // Detalles adicionales específicos
            $extraDetails = "";
            if ($inquiry->post && $inquiry->post->accommodation && isset($inquiry->data['roomTypeName'])) {
                $extraDetails = "\n🛏️ *Tipo Habitación:* " . $inquiry->data['roomTypeName'];
            } elseif ($inquiry->post && $inquiry->post->flight && isset($inquiry->data['returnFlight'])) {
                $extraDetails = "\n🔄 *Vuelo Retorno:* " . ($inquiry->data['returnFlight'] ? 'Sí' : 'No');
            }

            // Mensaje personalizado (si viene de contacto general)
            $mensajeCliente = "";
            if (!$inquiry->post && isset($inquiry->data['message'])) {
                $mensajeCliente = "\n💬 *Mensaje del Cliente:* " . $inquiry->data['message'];
            }

            // Construir mensaje final
            $formattedMessage = "*¡Nueva Consulta Asignada!* 🔔\n" .
                               "--------------------------------\n" .
                               "👤 *Cliente:* {$inquiry->client_name}\n" .
                               "📞 *Teléfono:* https://wa.me/{$cleanClientPhone}\n" .
                               "✉️ *Email:* {$inquiry->client_email}\n" .
                               "🏷️ *Tipo:* {$tipoConsulta}" .
                               $productDetails .
                               $productUrl .
                               $huespedesDetails .
                               $fechasDetails .
                               $extraDetails .
                               $mensajeCliente;

            // AUDIT DEBUG LOG: Capture detailed payload before dispatch
            Log::info("Payload Mensaje Enriquecido [WhatsApp]:", [
                'inquiry_id'     => $inquiry->inquiries_ID,
                'client_name'    => $inquiry->client_name,
                'tipo_consulta'  => $tipoConsulta,
                'precio_base'    => $priceText,
                'product_url'    => $productUrl ? trim(str_replace("\n🔗 *Enlace al producto:* ", "", $productUrl)) : 'N/A',
                'destinatario'   => $inquiry->consultant->phone,
                'full_message'   => $formattedMessage
            ]);

            Http::timeout(5)->post('http://localhost:3001/send', [
                'phone'      => $inquiry->consultant->phone,
                'message'    => $formattedMessage,
                'inquiry_id' => $inquiry->inquiries_ID,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al enviar notificación de WhatsApp al asignar: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Asesor asignado exitosamente y notificación enviada.',
            'data'    => $inquiry,
        ]);
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
