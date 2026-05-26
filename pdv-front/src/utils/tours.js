import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import router from '../router';

/**
 * Common popover configuration for driver.js
 */
const popoverConfig = {
    className: 'driver-popover-custom',
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Siguiente ➔',
    prevBtnText: '🠔 Anterior',
    doneBtnText: 'Entendido ✓',
    closeBtnText: '✕',
};

// ── Helpers ────────────────────────────────────────────────────────────────
const navigateTo = (path) => {
    if (window.location.pathname !== path) {
        router.navigate(path);
    }
};

const openSidebarSection = (sectionName) => {
    window.dispatchEvent(new CustomEvent('openSidebarSection', { detail: sectionName }));
};

// ── Admin Tour ─────────────────────────────────────────────────────────────
export const adminSteps = [
    {
        element: '#tour-dashboard-card',
        popover: { ...popoverConfig, title: '¡Bienvenido al Panel de Administración!', description: 'Aquí encontrarás un resumen de toda la actividad de la plataforma.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#tour-stats-row',
        popover: { ...popoverConfig, title: 'Estadísticas Generales', description: 'Un vistazo rápido a los números más importantes: paquetes, vuelos, hoteles activos y más.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#tour-consultas-chart',
        popover: { ...popoverConfig, title: 'Gráfico de Consultas', description: 'Visualiza la cantidad de consultas recibidas durante los últimos días.', side: 'top', align: 'center' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#nav-usuarios',
        popover: { ...popoverConfig, title: 'Gestión de Usuarios', description: 'Como Administrador, tienes acceso exclusivo para gestionar a los miembros de tu equipo.', side: 'right', align: 'center' },
        onHighlightStarted: () => {
            openSidebarSection('Menú');
            navigateTo('/dashboard/usuarios');
        }
    },
    {
        element: '#tour-usuarios-table',
        popover: { ...popoverConfig, title: 'Lista de Usuarios', description: 'Aquí puedes ver y buscar a todos los usuarios del sistema.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/usuarios')
    },
    {
        element: '#tour-usuarios-form',
        popover: { ...popoverConfig, title: 'Crear Usuario', description: 'Usa este formulario para invitar nuevos miembros y asignarles el rol de Editor o Asesor.', side: 'top', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/usuarios')
    },
    {
        element: '#nav-edit-pages',
        popover: { ...popoverConfig, title: 'Edición de Páginas', description: 'Aquí podrás cambiar los textos, información e imágenes públicas del sitio web.', side: 'right', align: 'start' },
        onHighlightStarted: () => {
            openSidebarSection('Editar Página');
            navigateTo('/dashboard/informacion');
        }
    },
];

// ── Editor Tour ────────────────────────────────────────────────────────────
export const editorSteps = [
    {
        element: '#tour-dashboard-card',
        popover: { ...popoverConfig, title: 'Panel del Editor', description: 'Desde aquí puedes gestionar el contenido público de la plataforma.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#nav-paquetes',
        popover: { ...popoverConfig, title: 'Menú de Ofertas', description: 'Empecemos revisando el inventario de paquetes.', side: 'right', align: 'center' },
        onHighlightStarted: () => {
            openSidebarSection('Catálogo');
            navigateTo('/dashboard/paquetes');
        }
    },
    {
        element: '#tour-paquetes-table',
        popover: { ...popoverConfig, title: 'Tus Paquetes', description: 'Administra los paquetes disponibles en la página principal, edítalos o archívalos.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/paquetes')
    },
    {
        element: '#form-paquete',
        popover: { ...popoverConfig, title: 'Crear Paquete', description: 'Crea rápidamente nuevas ofertas llenando este formulario. (Aplica igual para vuelos y hoteles).', side: 'top', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/paquetes')
    },
    {
        element: '#nav-blog',
        popover: { ...popoverConfig, title: 'Sección del Blog', description: 'También tienes acceso al blog de la plataforma.', side: 'right', align: 'center' },
        onHighlightStarted: () => {
            openSidebarSection('Catálogo');
            navigateTo('/dashboard/blog');
        }
    },
    {
        element: '#tour-blog-table',
        popover: { ...popoverConfig, title: 'Listado de Artículos', description: 'Crea artículos y consejos de viaje para mantener a tus clientes enganchados.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/blog')
    },
];

// ── Asesor Tour ────────────────────────────────────────────────────────────
export const asesorSteps = [
    {
        element: '#tour-dashboard-card',
        popover: { ...popoverConfig, title: 'Panel del Asesor', description: 'Tu centro de operaciones para atender las solicitudes de los clientes.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#tour-consultas-chart',
        popover: { ...popoverConfig, title: 'Volumen de Consultas', description: 'Lleva el registro de las consultas que han ingresado recientemente.', side: 'top', align: 'center' },
        onHighlightStarted: () => navigateTo('/dashboard')
    },
    {
        element: '#nav-consultas',
        popover: { ...popoverConfig, title: 'Buzón de Mensajes', description: 'Aquí es donde se reciben los mensajes de tus clientes.', side: 'right', align: 'center' },
        onHighlightStarted: () => {
            openSidebarSection('Atención');
            navigateTo('/dashboard/consultas');
        }
    },
    {
        element: '#tour-consultas-table',
        popover: { ...popoverConfig, title: 'Gestión de Consultas', description: 'Revisa, asigna y da seguimiento a todas las solicitudes de los clientes desde aquí.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/consultas')
    },
    {
        element: '#nav-whatsapp',
        popover: { ...popoverConfig, title: 'Conexión Directa', description: 'Asegúrate de que la mensajería funcione conectando tu celular.', side: 'right', align: 'center' },
        onHighlightStarted: () => {
            openSidebarSection('Atención');
            navigateTo('/dashboard/whatsapp');
        }
    },
    {
        element: '#tour-whatsapp-card',
        popover: { ...popoverConfig, title: 'Estado de WhatsApp', description: 'Verifica el estado de vinculación del asistente virtual de WhatsApp mediante un código o solicita uno nuevo.', side: 'bottom', align: 'start' },
        onHighlightStarted: () => navigateTo('/dashboard/whatsapp')
    },
];

/**
 * Helper to initialize a driver instance based on user role
 */
export const startTourByRole = (role) => {
    let steps = [];
    if (role === 1) steps = adminSteps;
    else if (role === 2) steps = editorSteps;
    else if (role === 3) steps = asesorSteps;

    if (steps.length === 0) return null;

    const driverObj = driver({
        showProgress: true,
        animate: true,
        progressText: 'Paso {{current}} de {{total}}',
        steps: steps,
        // Optional: Custom styling via CSS variables
        onDestroyStarted: async () => {
            if (!driverObj.hasNextStep()) {
                driverObj.destroy();
            } else {
                const { showConfirm } = await import('./swal');
                if (await showConfirm('¿Seguro que deseas salir del tour?')) {
                    driverObj.destroy();
                }
            }
        },
    });

    driverObj.drive();
    return driverObj;
};
