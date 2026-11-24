// Prerender SEO: genera dist/<ruta>/index.html con title, description,
// canonical y Open Graph ya incluidos en el HTML (visibles para crawlers sin JS).
// Se ejecuta después de `vite build`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const BASE_URL = 'https://plandeviaje.com.ve';

const { SEO } = await import(pathToFileURL(join(root, 'src/utils/seoConfig.js')).href);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const template = readFileSync(join(dist, 'index.html'), 'utf8');

const render = ({ title, description, path, ogTitle, ogDescription }) => {
    const url = `${BASE_URL}${path}`;
    const tags = [
        `<title>${esc(title)}</title>`,
        `<meta data-prerender name="description" content="${esc(description)}">`,
        `<link data-prerender rel="canonical" href="${url}">`,
        `<meta data-prerender property="og:type" content="website">`,
        `<meta data-prerender property="og:site_name" content="Plan de Viaje">`,
        `<meta data-prerender property="og:title" content="${esc(ogTitle)}">`,
        `<meta data-prerender property="og:description" content="${esc(ogDescription)}">`,
        `<meta data-prerender property="og:url" content="${url}">`,
        `<meta data-prerender property="og:locale" content="es_VE">`,
        // Si el fallback SPA sirve este HTML en otra ruta, descarta las etiquetas prerenderizadas.
        `<script>if(location.pathname.replace(/[/]+$/,'')!==${JSON.stringify(path === '/' ? '' : path)}){document.querySelectorAll('[data-prerender]').forEach(function(e){e.remove()});document.title='Plan de Viaje'}</script>`,
    ].join('\n    ');

    // Quita el <title> genérico para evitar duplicados.
    const html = template.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
    return html.replace('</head>', `    ${tags}\n  </head>`);
};

for (const seo of Object.values(SEO)) {
    const file = seo.path === '/' ? join(dist, 'index.html') : join(dist, seo.path, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, render(seo));
    console.log(`prerender: ${seo.path} -> ${file}`);
}
