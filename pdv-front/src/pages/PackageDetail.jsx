import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import DetailBanner from '../components/detail/DetailBanner';
import DetailHero from '../components/detail/DetailHero';
import PackageInfo from '../components/detail/PackageInfo';
import BookingForm from '../components/detail/BookingForm';
import LocationMap from '../components/detail/LocationMap';
import PromoCardCarousel from '../components/home/PromoCardCarousel';
import mgtathmb from '../assets/mgtathmb.jpg';
import { MapPinIcon, StarIcon } from '@phosphor-icons/react';

/**
 * Vista de detalle de un paquete turístico.
 * Carga la información del paquete desde la API y muestra
 * galería, características, formulario de consulta y paquetes relacionados.
 */

const PackageDetail = () => {
    const { id } = useParams();
    const [pkg, setPkg] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    useDocumentTitle(pkg?.post?.name || 'Paquete');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [pkgRes, allRes] = await Promise.all([
                    api.get(`/packages/${id}`),
                    api.get('/packages'),
                ]);
                setPkg(pkgRes.data);
                // Relacionados: excluir el actual, tomar hasta 5
                const others = (allRes.data || []).filter(p => String(p.packages_ID) !== String(id));
                setRelated(others.slice(0, 5));
            } catch (err) {
                console.error('Error fetching package:', err);
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

    if (!pkg) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#001f6c]">
                <p className="text-lg font-semibold">Paquete no encontrado</p>
            </div>
        );
    }

    // Mapeo de datos de la API a props de los componentes
    const title = pkg.post?.name || 'Paquete';
    const price = `$${pkg.starting_price || 0}`;
    const destination = pkg.accommodation?.post?.name || pkg.destination || 'Venezuela';
    
    const badges = [
        {
            icon: <MapPinIcon className="w-5 h-5" />,
            text: destination,
        },
    ];
    if (pkg.rating) {
        badges.push({
            icon: <StarIcon weight="fill" className="w-5 h-5 text-amber-500" />,
            text: String(pkg.rating),
        });
    }

    // Banner del post
    const bannerImage = pkg.post?.banner ? getImageUrl(pkg.post.banner) : undefined;

    // Galería de imágenes del post
    const images = [];
    if (pkg.post?.images && pkg.post.images.length > 0) {
        pkg.post.images.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) images.push(getImageUrl(url));
        });
    }
    // Si no hay galería, usar el thumbnail como imagen principal
    if (images.length === 0 && pkg.post?.thumbnail) {
        images.push(getImageUrl(pkg.post.thumbnail));
    }

    // Características del paquete (root-level 'features')
    const amenities = (pkg.features || []).map(f => ({
        icon: f.icon || 'wifi',
        label: f.label || 'Servicio',
    }));
    // Incluir también características del alojamiento asociado
    if (pkg.accommodation?.features) {
        pkg.accommodation.features.forEach(f => {
            // Evitar duplicados comparando icon + label
            const exists = amenities.some(a => a.icon === f.icon && a.label === f.label);
            if (!exists) {
                amenities.push({ icon: f.icon || 'wifi', label: f.label || 'Servicio' });
            }
        });
    }

    const details = {
        accommodation: typeof pkg.accommodation === 'object' ? (pkg.accommodation?.post?.name || 'Alojamiento') : (pkg.accommodation || 'Alojamiento'),
        days: pkg.days || pkg.duration || 'Consultar',
        guestType: typeof pkg.guest_type === 'object' ? (pkg.guest_type?.type || 'Consultar') : (pkg.guest_type || 'Pareja / Familiar'),
        boardType: typeof pkg.board_type === 'object' ? (pkg.board_type?.type || 'Consultar') : (pkg.board_type || 'Consultar'),
        description: pkg.post?.information || pkg.post?.overview || 'Descripción no disponible.',
        amenities,
    };

    const relatedCards = related.map(p => ({
        id: p.packages_ID,
        image: p.post?.thumbnail ? getImageUrl(p.post.thumbnail) : mgtathmb,
        title: p.post?.name || 'Paquete',
        subtitle: p.post?.overview || '',
        priceLabel: 'Desde',
        priceValue: `$${p.starting_price}`,
        ctaLabel: 'Ver Paquete',
        link: `/package/${p.packages_ID}`,
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
                        <PackageInfo {...details} />
                    </div>
                    <div className="lg:w-4/12">
                        <BookingForm
                            price={price}
                            priceLabel="/ persona"
                        />
                    </div>
                </div>
            </section>

            <LocationMap query={`${details.accommodation}, Venezuela`} />

            {relatedCards.length > 0 && (
                <section className="px-4 sm:px-6 py-10">
                    <PromoCardCarousel
                        title="Otros paquetes populares"
                        subtitle="Descubre más destinos increíbles"
                        items={relatedCards}
                    />
                </section>
            )}
        </div>
    );
};

export default PackageDetail;
