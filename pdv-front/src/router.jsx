import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './layouts/Layout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Lazy-loaded pages (Public)
const Home = lazy(() => import('./pages/Home'));
const Contacto = lazy(() => import('./pages/Contacto'));
const BlogView = lazy(() => import('./pages/BlogView'));
const VuelosView = lazy(() => import('./pages/VuelosView'));
const PackageDetail = lazy(() => import('./pages/PackageDetail'));
const FlightDetail = lazy(() => import('./pages/FlightDetail'));
const AccommodationDetail = lazy(() => import('./pages/AccommodationDetail'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// NUEVA RUTA: Vista dinámica para destinos específicos (Margarita, Los Roques, etc.)
const DestinoDetailView = lazy(() => import('./pages/DestinoDetailView'));

// Admin pages
const Paquetes = lazy(() => import('./pages/admin/Paquetes'));
const Vuelos = lazy(() => import('./pages/admin/Vuelos'));
const Hoteles = lazy(() => import('./pages/admin/Hoteles'));
const Blog = lazy(() => import('./pages/admin/Blog'));
const Consultas = lazy(() => import('./pages/admin/Consultas'));
const Asesores = lazy(() => import('./pages/admin/Asesores'));
const Usuarios = lazy(() => import('./pages/admin/Usuarios'));
const WhatsappSettings = lazy(() => import('./pages/admin/WhatsappSettings'));
const Ayuda = lazy(() => import('./pages/admin/Ayuda'));
const Informacion = lazy(() => import('./pages/admin/Informacion'));
const Imagenes = lazy(() => import('./pages/admin/Imagenes'));
const Contenido = lazy(() => import('./pages/admin/Contenido'));

const About = lazy(() => import('./pages/admin/About'));

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const withSuspense = (Component) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { path: '/', element: withSuspense(Home) },
            { path: 'contacto', element: withSuspense(Contacto) },
            { path: 'blog', element: withSuspense(BlogView) },
            { path: 'vuelos', element: withSuspense(VuelosView) },
            { path: 'about', element: withSuspense(About) },
            { path: 'package/:id', element: withSuspense(PackageDetail) },
            { path: 'vuelo/:id', element: withSuspense(FlightDetail) },
            { path: 'hotel/:id', element: withSuspense(AccommodationDetail) },

            // AGREGADO: Ruta para filtrar hoteles por destino
            // Esto permite URLs como /hoteles/margarita o /hoteles/los-roques
            { path: 'hoteles/:destino', element: withSuspense(DestinoDetailView) },

            { path: 'login', element: withSuspense(Login) },
        ],
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: withSuspense(Dashboard) },
            { path: 'paquetes', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Paquetes)}</RoleRoute> },
            { path: 'vuelos', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Vuelos)}</RoleRoute> },
            { path: 'hoteles', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Hoteles)}</RoleRoute> },
            { path: 'blog', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Blog)}</RoleRoute> },
            { path: 'consultas', element: <RoleRoute allowedRoles={[1, 3]}>{withSuspense(Consultas)}</RoleRoute> },
            { path: 'asesores', element: <RoleRoute allowedRoles={[1, 3]}>{withSuspense(Asesores)}</RoleRoute> },
            { path: 'usuarios', element: <RoleRoute allowedRoles={[1]}>{withSuspense(Usuarios)}</RoleRoute> },
            { path: 'whatsapp', element: <RoleRoute allowedRoles={[1, 3]}>{withSuspense(WhatsappSettings)}</RoleRoute> },
            { path: 'ayuda', element: <RoleRoute allowedRoles={[1, 2, 3]}>{withSuspense(Ayuda)}</RoleRoute> },
            { path: 'informacion', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Informacion)}</RoleRoute> },
            { path: 'imagenes', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Imagenes)}</RoleRoute> },
            { path: 'contenido', element: <RoleRoute allowedRoles={[1, 2]}>{withSuspense(Contenido)}</RoleRoute> },
        ],
    },
]);

export default router;