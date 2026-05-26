import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import DetailBanner from '../components/detail/DetailBanner';
import DetailHero from '../components/detail/DetailHero';
import AccommodationInfo from '../components/detail/AccommodationInfo';
import BookingForm from '../components/detail/BookingForm';
import LocationMap from '../components/detail/LocationMap';
import PromoCardCarousel from '../components/home/PromoCardCarousel';
import mgtathmb from '../assets/mgtathmb.jpg';
import { MapPinIcon, StarIcon } from '@phosphor-icons/react';

/**
 * Vista de detalle de un alojamiento.
 * Carga la información del hotel desde la API y muestra
 * galería, características, formulario de consulta y alojamientos relacionados.
 */
const AccommodationDetail = () => {
    const { id } = useParams();
    const [accommodation, setAccommodation] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    useDocumentTitle(accommodation?.post?.name || 'Hotel');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [accRes, allRes] = await Promise.all([
                    api.get(`/accommodations/${id}`),
                    api.get('/accommodations'),
                ]);
                setAccommodation(accRes.data);
                const others = (allRes.data || []).filter(
                    a => String(a.accommodation_ID) !== String(id)
                );
                setRelated(others.slice(0, 5));
            } catch (err) {
                console.error('Error al cargar alojamiento:', err);
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

    if (!accommodation) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#001f6c]">
                <p className="text-lg font-semibold">Alojamiento no encontrado</p>
            </div>
        );
    }

    const title = accommodation.post?.name || 'Hotel';
    const price = `Desde $${accommodation.starting_price || 0}`;
    const destination = accommodation.destination || 'Venezuela';

    const badges = [
        { icon: <MapPinIcon className="w-5 h-5" />, text: destination },
    ];

    if (accommodation.stars) {
        badges.push({
            icon: <StarIcon weight="fill" className="w-5 h-5 text-amber-500" />,
            text: `${accommodation.stars} estrellas`,
        });
    }

    // Banner
    const bannerImage = accommodation.post?.banner
        ? getImageUrl(accommodation.post.banner)
        : undefined;

    // Galería de imágenes
    const images = [];
    if (accommodation.post?.images?.length > 0) {
        accommodation.post.images.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) images.push(getImageUrl(url));
        });
    }
    if (images.length === 0 && accommodation.post?.thumbnail) {
        images.push(getImageUrl(accommodation.post.thumbnail));
    }

    // Características del alojamiento
    const amenities = (accommodation.features || []).map(f => ({
        icon: f.icon || 'info',
        label: f.label || 'Servicio',
    }));

    // Tipos de habitación disponibles
    const rooms = (accommodation.room_types || []).map(rt => ({
        id: rt.room_type_ID,
        name: rt.type,
    }));

    const details = {
        destination,
        stars: accommodation.stars || 0,
        boardType: accommodation.board_type?.type || 'Consultar',
        description: accommodation.post?.information || accommodation.post?.overview || 'Descripción no disponible.',
        amenities,
    };

    const relatedCards = related.map(a => ({
        id: a.accommodation_ID,
        image: a.post?.thumbnail ? getImageUrl(a.post.thumbnail) : mgtathmb,
        title: a.post?.name || 'Hotel',
        subtitle: a.post?.overview || '',
        priceLabel: 'Desde',
        priceValue: `$${a.starting_price}`,
        ctaLabel: 'Ver Hotel',
        link: `/hotel/${a.accommodation_ID}`,
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
                        <AccommodationInfo {...details} />
                    </div>
                    <div className="lg:w-4/12">
                        <BookingForm
                            price={price}
                            priceLabel="/ noche"
                            isAccommodation={true}
                            roomTypes={rooms}
                        />
                    </div>
                </div>
            </section>

            <LocationMap query={`${title}, ${destination}`} />

            {relatedCards.length > 0 && (
                <section className="px-4 sm:px-6 py-10">
                    <PromoCardCarousel
                        title="Otros alojamientos populares"
                        subtitle="Explora las mejores opciones de estadía"
                        items={relatedCards}
                    />
                </section>
            )}
        </div>
    );
};

export default AccommodationDetail;
