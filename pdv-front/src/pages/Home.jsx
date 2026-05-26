import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import FilterBar from '../components/home/FilterBar';
import HeroSlider from '../components/home/HeroSlider';
import PromoCardCarousel from '../components/home/PromoCardCarousel';
import TestimonialCarousel from '../components/home/TestimonialCarousel';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';

import mgtathmb from '../assets/mgtathmb.jpg';
import testimonial1 from '../assets/testimonial1.jpg';
import testimonial2 from '../assets/testimonial2.jpg';
import testimonial3 from '../assets/testimonial3.jpg';

const TESTIMONIALS = [
    { image: testimonial1, name: 'María G.', stars: 5, quote: 'Excelente servicio en todo. Tanto los hoteles, transporte y atención. Gracias a usted por sus servicios.' },
    { image: testimonial2, name: 'Carlos R.', stars: 5, quote: 'Excelente servicio en todo. Excelente las habitaciones, piscina, buena comida y muy buena atención.' },
    { image: testimonial3, name: 'Andrea P.', stars: 5, quote: 'La atención de mi bella Leodalbis increíble, como siempre la mejor en todo desde hace ya 3 años.' },
    { image: testimonial1, name: 'María G.', stars: 5, quote: 'Excelente servicio en todo. Tanto los hoteles, transporte y atención. Gracias a usted por sus servicios.' },
    { image: testimonial2, name: 'Carlos R.', stars: 5, quote: 'Excelente servicio en todo. Excelente las habitaciones, piscina, buena comida y muy buena atención.' },
    { image: testimonial3, name: 'Andrea P.', stars: 5, quote: 'La atención de mi bella Leodalbis increíble, como siempre la mejor en todo desde hace ya 3 años.' },
];

const Home = () => {
    useDocumentTitle('Inicio');
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [flights, setFlights] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [filters, setFilters] = useState(null);
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // accommodations para evitar el 404
                const [pRes, fRes, hRes] = await Promise.all([
                    api.get('/packages'), 
                    api.get('/flights'),
                    api.get('/accommodations')
                ]);
                
                const pData = pRes.data || [];
                const fData = fRes.data || [];
                const hData = hRes.data || [];
                
                setPackages(pData);
                setFlights(fData);
                setHotels(hData);

                // Cálculo de precios incluyendo hoteles
                let minP = Infinity;
                let maxP = -Infinity;
                
                const processPrice = (item) => {
                    const price = Number(item.starting_price);
                    if (!isNaN(price)) {
                        if (price < minP) minP = price;
                        if (price > maxP) maxP = price;
                    }
                };

                pData.forEach(processPrice);
                fData.forEach(processPrice);
                hData.forEach(processPrice);

                if (minP === Infinity) minP = 0;
                if (maxP === -Infinity) maxP = 1000;

                setPriceBounds({ min: minP, max: maxP });

            } catch (err) {
                console.error('Error loading home data:', err);
            }
        };
        fetchData();
    }, []);

    const filterItems = (items) => {
        if (!filters) return [];
        return items.filter(item => {
            const locMatch = !filters.ubicacion || 
                (item.destination && item.destination.toLowerCase().includes(filters.ubicacion.toLowerCase())) ||
                (item.accommodation?.post?.name && item.accommodation.post.name.toLowerCase().includes(filters.ubicacion.toLowerCase())) ||
                (item.post?.name && item.post.name.toLowerCase().includes(filters.ubicacion.toLowerCase()));

            const price = Number(item.starting_price);
            const priceMatch = !filters.priceRange || (price >= filters.priceRange.min && price <= filters.priceRange.max);

            let dateMatch = true;
            if (filters.startDate && item.end_date) {
                dateMatch = new Date(item.end_date) >= new Date(filters.startDate);
            }

            return locMatch && priceMatch && dateMatch;
        });
    };

    const mapPackageToCard = (p) => ({
        id: p.packages_ID,
        image: p.post?.thumbnail ? getImageUrl(p.post.thumbnail) : mgtathmb,
        title: p.post?.name || 'Paquete',
        subtitle: p.post?.overview || 'Detalle del paquete',
        priceLabel: 'Desde',
        priceValue: `$${p.starting_price}`,
        ctaLabel: 'Ver Paquetes',
        link: `/package/${p.packages_ID}`,
        onCtaClick: () => navigate(`/package/${p.packages_ID}`),
    });

    const mapFlightToCard = (f) => ({
        id: f.flights_ID,
        image: f.post?.thumbnail ? getImageUrl(f.post.thumbnail) : mgtathmb,
        title: f.post?.name || `Vuelo a ${f.destination || 'Destino'}`,
        subtitle: f.post?.overview || 'Boletería aérea disponible',
        priceLabel: 'Desde',
        priceValue: `$${f.starting_price}`,
        ctaLabel: 'Ver Vuelo',
        link: `/vuelo/${f.flights_ID}`,
        onCtaClick: () => navigate(`/vuelo/${f.flights_ID}`),
    });

    const mapHotelToCard = (h) => ({
        id: h.accommodation_ID,
        image: h.post?.thumbnail ? getImageUrl(h.post.thumbnail) : mgtathmb,
        title: h.post?.name || 'Hotel',
        subtitle: h.post?.overview || 'Estadía garantizada',
        priceLabel: 'Desde',
        priceValue: `$${h.starting_price}`,
        ctaLabel: 'Ver Hotel',
        link: `/hotel/${h.accommodation_ID}`,
        onCtaClick: () => navigate(`/hotel/${h.accommodation_ID}`),
    });

    const searchResults = filters ? [
        ...filterItems(packages).map(mapPackageToCard),
        ...filterItems(hotels).map(mapHotelToCard),
        ...filterItems(flights).map(mapFlightToCard)
    ] : [];

    return (
        <div>
            <HeroSlider />
            <FilterBar onSearch={setFilters} minBound={priceBounds.min} maxBound={priceBounds.max} />

            {filters && (
                <section className="px-4 sm:px-6 py-10 bg-blue-50/50 border-b border-[#001f6c]/10 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#ed6f00]"></div>
                    <PromoCardCarousel
                        title="Resultados de la búsqueda"
                        subtitle={searchResults.length > 0 ? `Encontramos ${searchResults.length} opciones ideales para ti` : 'No encontramos resultados exactos, explora nuestras promos abajo.'}
                        items={searchResults}
                    />
                </section>
            )}

            <section className="px-4 sm:px-6 py-10">
                <PromoCardCarousel
                    title="Paquetes irresistibles"
                    subtitle="Viaja pagando en cómodas cuotas"
                    items={packages.map(mapPackageToCard)}
                />
            </section>

            {/* Carrusel de hoteles justo debajo de paquetes */}
            <section className="px-4 sm:px-6 py-10">
                <PromoCardCarousel
                    title="Hospedajes destacados"
                    subtitle="Los mejores hoteles para tu descanso"
                    items={hotels.map(mapHotelToCard)}
                />
            </section>

            <section className="px-4 sm:px-6 py-10">
                <PromoCardCarousel
                    title="Oferta en Boletería Aérea"
                    subtitle="Boletería nacional e internacional"
                    items={flights.map(mapFlightToCard)}
                />
            </section>

            {/* ── Testimonials ────────────────────────────────────── */}
            <section className="px-4 sm:px-6 py-10">
                <TestimonialCarousel
                    title="Lo que dicen nuestros viajeros"
                    subtitle="Experiencias reales de quienes confiaron en nosotros"
                    items={TESTIMONIALS}
                />
            </section>
        </div>
    );
};

export default Home;