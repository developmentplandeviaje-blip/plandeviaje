import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api/axios';
import StatsCard from '../components/dashboard/StatsCard';
import ConsultasChart from '../components/dashboard/ConsultasChart';
import TopListCard from '../components/dashboard/TopListCard';

const Dashboard = () => {
    useDocumentTitle('Dashboard');
    const [stats, setStats] = useState({
        packages: 0,
        flights: 0,
        accommodations: 0,
        blogPosts: 0,
        consultas: 0,
    });
    const [topPackages, setTopPackages] = useState([]);
    const [topFlights, setTopFlights] = useState([]);
    const [topPosts, setTopPosts] = useState([]);
    const [consultasData, setConsultasData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [pkgRes, flightRes, hotelRes, blogRes, consultaRes] = await Promise.allSettled([
                    api.get('/packages'),
                    api.get('/flights'),
                    api.get('/accommodations'),
                    api.get('/blog-posts'),
                    api.get('/consultas'),
                ]);

                // Extraer datos de las respuestas
                const rawPackages = pkgRes.status === 'fulfilled' ? (pkgRes.value.data || []) : [];
                const rawFlights = flightRes.status === 'fulfilled' ? (flightRes.value.data || []) : [];
                const hotels = hotelRes.status === 'fulfilled' ? (hotelRes.value.data || []) : [];
                const blogs = blogRes.status === 'fulfilled' ? (blogRes.value.data || []) : [];
                const consultas = consultaRes.status === 'fulfilled' ? (consultaRes.value.data || []) : [];

                // --- SOLUCIÓN A DUPLICADOS (Lógica de Sistemas) ---
                // Usamos Set para contar IDs únicos, ignorando las filas repetidas por los JOINs
                const uniquePackagesCount = new Set(rawPackages.map(p => p.packages_ID)).size;
                const uniqueFlightsCount = new Set(rawFlights.map(f => f.flights_ID)).size;

                // Crear versiones únicas para las listas de "Top" (para que no se repitan nombres)
                const uniquePkgList = Array.from(new Map(rawPackages.map(p => [p.packages_ID, p])).values());
                const uniqueFltList = Array.from(new Map(rawFlights.map(f => [f.flights_ID, f])).values());

                setStats({
                    packages: uniquePackagesCount,
                    flights: uniqueFlightsCount,
                    accommodations: hotels.length,
                    blogPosts: blogs.length,
                    consultas: consultas.length,
                });

                // Top packages (usando la lista ya filtrada)
                setTopPackages(
                    uniquePkgList
                        .filter(p => p.post?.name)
                        .slice(0, 5)
                        .map(p => p.post.name)
                );

                // Top flights (usando la lista ya filtrada)
                setTopFlights(
                    uniqueFltList
                        .filter(f => f.destination || f.post?.name)
                        .slice(0, 5)
                        .map(f => f.destination || f.post?.name)
                );

                // Top blog posts
                setTopPosts(
                    blogs
                        .filter(b => b.name || b.post?.name)
                        .slice(0, 5)
                        .map(b => b.name || b.post?.name)
                );

                // Gráfico de consultas semanales
                const weekCounts = [0, 0, 0, 0, 0, 0, 0];
                consultas.forEach(c => {
                    const date = new Date(c.created_at);
                    if (!isNaN(date.getTime())) {
                        const day = (date.getDay() + 6) % 7; // Ajuste Mon-Sun
                        weekCounts[day]++;
                    }
                });
                setConsultasData(weekCounts);

            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const STATS_CARDS = [
        { label: 'Paquetes Activos', value: stats.packages, to: '/dashboard/paquetes' },
        { label: 'Vuelos', value: stats.flights, to: '/dashboard/vuelos' },
        { label: 'Hoteles', value: stats.accommodations, to: '/dashboard/hoteles' },
        { label: 'Posts Blog', value: stats.blogPosts, to: '/dashboard/blog' },
        { label: 'Consultas Realizadas', value: stats.consultas, to: '/dashboard/consultas' },
    ];

    return (
        <div className="p-6 space-y-6 bg-[#f8f9fe] min-h-screen">
            <div id="tour-dashboard-card">
                <h1 className="text-2xl font-extrabold text-[#001f6c]">Dashboard</h1>
                <p className="text-sm text-[#8898aa] mt-0.5">
                    Resumen general de Plan de Viaje
                </p>
            </div>

            {/* Fila 1: Stats */}
            <div id="tour-stats-row" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {STATS_CARDS.map((s) => (
                    <StatsCard
                        key={s.label}
                        label={s.label}
                        value={loading ? '–' : s.value}
                        to={s.to}
                    />
                ))}
            </div>

            {/* Fila 2: Gráfico */}
            <div id="tour-consultas-chart">
                <ConsultasChart
                    data={consultasData}
                    loading={loading}
                    to="/dashboard/consultas"
                />
            </div>

            {/* Fila 3: Listas Top */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TopListCard
                    title="Paquete más consultado"
                    items={topPackages}
                    to="/dashboard/paquetes"
                />
                <TopListCard
                    title="Vuelos más consultado"
                    items={topFlights}
                    to="/dashboard/vuelos"
                />
                <TopListCard
                    title="Post más visitado"
                    items={topPosts}
                    to="/dashboard/blog"
                />
            </div>
        </div>
    );
};

export default Dashboard;