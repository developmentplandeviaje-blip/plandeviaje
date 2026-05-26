import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import DetailBanner from '../components/detail/DetailBanner';
import DetailHero from '../components/detail/DetailHero';
import FlightInfo from '../components/detail/FlightInfo';
import BookingForm from '../components/detail/BookingForm';
import LocationMap from '../components/detail/LocationMap';
import PromoCardCarousel from '../components/home/PromoCardCarousel';
import mgtathmb from '../assets/mgtathmb.jpg';
import bannerflight from '../assets/bannerflight.jpg';
import { MapPinIcon } from '@phosphor-icons/react';

/**
 * Vista de detalle de un vuelo.
 * Carga la información del vuelo desde la API y muestra
 * galería, requisitos, formulario de consulta y vuelos relacionados.
 */

const FlightDetail = () => {
    const { id } = useParams();
    const [flight, setFlight] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    useDocumentTitle(flight?.post?.name || 'Vuelo');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [flightRes, allRes] = await Promise.all([
                    api.get(`/flights/${id}`),
                    api.get('/flights'),
                ]);
                setFlight(flightRes.data);
                const others = (allRes.data || []).filter(f => String(f.flights_ID) !== String(id));
                setRelated(others.slice(0, 5));
            } catch (err) {
                console.error('Error fetching flight:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#001f6c]">
                <p className="text-lg font-semibold">Vuelo no encontrado</p>
            </div>
        );
    }

    const title = flight.post?.name || `Vuelo a ${flight.destination || 'Destino'}`;
    const price = `Desde $${flight.starting_price || 0}`;
    const destination = flight.destination || 'Destino';

    const badges = [
        {
            icon: <MapPinIcon className="w-5 h-5" />,
            text: destination,
        },
    ];

    // Banner del post
    const bannerImage = flight.post?.banner ? getImageUrl(flight.post.banner) : bannerflight;

    // Galería de imágenes del post
    const images = [];
    if (flight.post?.images && flight.post.images.length > 0) {
        flight.post.images.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) images.push(getImageUrl(url));
        });
    }
    // Si no hay galería, usar el thumbnail como imagen principal
    if (images.length === 0 && flight.post?.thumbnail) {
        images.push(getImageUrl(flight.post.thumbnail));
    }

    // Requisitos del vuelo
    const requirements = [];
    if (flight.requirements) {
        if (Array.isArray(flight.requirements)) {
            requirements.push(...flight.requirements);
        } else if (typeof flight.requirements === 'string') {
            requirements.push(...flight.requirements.split('\n').filter(Boolean));
        }
    }

    // Características del vuelo (array de {icon, label})
    const amenities = (flight.features || []).map(f => ({
        icon: f.icon || 'info',
        label: f.label || 'Servicio',
    }));

    const country = typeof flight.country === 'object' ? (flight.country?.name || '') : (flight.country || '');

    const details = {
        destination,
        country,
        requirementsShort: requirements.length > 0 ? `${requirements.length} Documentos` : 'Consultar',
        guestType: typeof flight.guest_type === 'object' ? (flight.guest_type?.type || 'Por Persona') : (flight.guest_type || 'Por Persona'),
        boardType: typeof flight.board_type === 'object' ? (flight.board_type?.type || 'Solo Vuelo') : (flight.board_type || 'Solo Vuelo'),
        description: flight.post?.information || flight.post?.overview || 'Descripción no disponible.',
        requirements,
        amenities,
    };

    const relatedCards = related.map(f => ({
        id: f.flights_ID,
        image: f.post?.thumbnail ? getImageUrl(f.post.thumbnail) : mgtathmb,
        title: f.post?.name || `Vuelo a ${f.destination || 'Destino'}`,
        subtitle: f.post?.overview || 'Boletería aérea disponible',
        priceLabel: 'Desde',
        priceValue: `$${f.starting_price}`,
        ctaLabel: 'Ver Vuelo',
        link: `/vuelo/${f.flights_ID}`,
    }));

    return (
        <div className="pb-6">
            <DetailBanner image={bannerImage} />

            <DetailHero
                title={title}
                badges={badges}
                images={images}
            />

            <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 mt-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                    <div className="lg:w-8/12">
                        <FlightInfo {...details} />
                    </div>
                    <div className="lg:w-4/12">
                        <BookingForm
                            price={price}
                            priceLabel=""
                            isFlight={true}
                        />
                    </div>
                </div>
            </section>

            <LocationMap query={destination} />

            {relatedCards.length > 0 && (
                <section className="px-4 sm:px-6 py-10">
                    <PromoCardCarousel
                        title="Otros vuelos populares"
                        subtitle="Descubre más destinos desde tu ciudad"
                        items={relatedCards}
                    />
                </section>
            )}
        </div>
    );
};

export default FlightDetail;
