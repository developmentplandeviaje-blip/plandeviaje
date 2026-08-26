<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Accommodation;
use App\Models\Flight;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;

class SitemapController extends Controller
{
    private const CACHE_KEY = 'sitemap.xml';
    private const CACHE_TTL = 86400; // 24 horas

    /**
     * Generar y retornar el sitemap.xml.
     */
    public function index()
    {
        $xml = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->generateSitemapXml();
        });

        return Response::make($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8'
        ]);
    }

    /**
     * Compilar la estructura XML.
     */
    private function generateSitemapXml(): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://www.plandeviaje.com.ve'), '/');

        // 1. Obtener datos activos con sus posts relacionados para la fecha de última modificación
        $packages = Package::with('post')->where('isActive', true)->get();
        $accommodations = Accommodation::with('post')->where('isActive', true)->get();
        $flights = Flight::with('post')->where('isActive', true)->get();

        // 2. Construir el XML estructurado
        $xml = [];
        $xml[] = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // ── Páginas Estáticas ────────────────────────────────────────────────
        // Inicio
        $xml[] = '  <url>';
        $xml[] = "    <loc>{$frontendUrl}/</loc>";
        $xml[] = '    <lastmod>' . now()->toDateString() . '</lastmod>';
        $xml[] = '    <changefreq>daily</changefreq>';
        $xml[] = '    <priority>1.0</priority>';
        $xml[] = '  </url>';

        // Nosotros (about)
        $xml[] = '  <url>';
        $xml[] = "    <loc>{$frontendUrl}/about</loc>";
        $xml[] = '    <lastmod>' . now()->toDateString() . '</lastmod>';
        $xml[] = '    <changefreq>monthly</changefreq>';
        $xml[] = '    <priority>0.5</priority>';
        $xml[] = '  </url>';

        // Contacto
        $xml[] = '  <url>';
        $xml[] = "    <loc>{$frontendUrl}/contacto</loc>";
        $xml[] = '    <lastmod>' . now()->toDateString() . '</lastmod>';
        $xml[] = '    <changefreq>monthly</changefreq>';
        $xml[] = '    <priority>0.5</priority>';
        $xml[] = '  </url>';

        // ── Páginas Dinámicas: Paquetes ──────────────────────────────────────
        foreach ($packages as $pkg) {
            $lastmod = $pkg->post->updated_at ?? $pkg->post->created_at ?? now();
            $lastmodStr = $lastmod->toDateString();
            $xml[] = '  <url>';
            $xml[] = "    <loc>{$frontendUrl}/package/{$pkg->slug}</loc>";
            $xml[] = "    <lastmod>{$lastmodStr}</lastmod>";
            $xml[] = '    <changefreq>weekly</changefreq>';
            $xml[] = '    <priority>0.8</priority>';
            $xml[] = '  </url>';
        }

        // ── Páginas Dinámicas: Hoteles ───────────────────────────────────────
        foreach ($accommodations as $acc) {
            $lastmod = $acc->post->updated_at ?? $acc->post->created_at ?? now();
            $lastmodStr = $lastmod->toDateString();
            $xml[] = '  <url>';
            $xml[] = "    <loc>{$frontendUrl}/hotel/{$acc->slug}</loc>";
            $xml[] = "    <lastmod>{$lastmodStr}</lastmod>";
            $xml[] = '    <changefreq>weekly</changefreq>';
            $xml[] = '    <priority>0.8</priority>';
            $xml[] = '  </url>';
        }

        // ── Páginas Dinámicas: Vuelos ────────────────────────────────────────
        foreach ($flights as $flg) {
            $lastmod = $flg->post->updated_at ?? $flg->post->created_at ?? now();
            $lastmodStr = $lastmod->toDateString();
            $xml[] = '  <url>';
            $xml[] = "    <loc>{$frontendUrl}/vuelo/{$flg->slug}</loc>";
            $xml[] = "    <lastmod>{$lastmodStr}</lastmod>";
            $xml[] = '    <changefreq>weekly</changefreq>';
            $xml[] = '    <priority>0.8</priority>';
            $xml[] = '  </url>';
        }

        $xml[] = '</urlset>';

        return implode("\n", $xml);
    }
}
