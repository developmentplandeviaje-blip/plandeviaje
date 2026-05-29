import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import * as Icons from '@phosphor-icons/react';
import PromoCard from '../components/home/PromoCard';

// 1. Imagenes importadas para cada destino
import bannerCanaima from '../assets/bannercanaima.jpg';
import bannerCoche from '../assets/bannercoche.jpg';
import bannerMargarita from '../assets/bannermargarita.jpg';
import bannerLosRoques from '../assets/bannerlosroques.jpg';
import bannerMerida from '../assets/bannermerida.jpg';
import bannerMorrocoy from '../assets/bannermorrocoy.jpg';
import bannerDefault from '../assets/bannermargarita.jpg'; 

// 2. Mapeo de Banners usando las variables importadas
const DESTINO_BANNERS = {
    'canaima': bannerCanaima,
    'coche': bannerCoche,
    'margarita': bannerMargarita,
    'los-roques': bannerLosRoques,
    'merida': bannerMerida,
    'morrocoy': bannerMorrocoy,
    'default': bannerDefault
};

const DestinoDetailView = () => {
    const { destino } = useParams(); 
    const [hoteles, setHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHoteles = async () => {
            try {
                setLoading(true);
                const res = await api.get('/accommodations');
                
                const destinoURL = destino.toLowerCase().replace(/-/g, ' '); 
                
                const filtrados = res.data.filter(h => {
                    if (!h.destination) return false;
                    const destinoDB = h.destination.toLowerCase();
                    return destinoDB.includes(destinoURL) || destinoURL.includes(destinoDB);
                });
                
                setHoteles(filtrados);
            } catch (err) {
                console.error("Error cargando hoteles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHoteles();
    }, [destino]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#001f6c] border-t-[#ed6f00] rounded-full animate-spin"></div>
        </div>
    );

    const nombreDestino = destino.replace(/-/g, ' ').toUpperCase();
    
    // Seleccionamos el banner basado en el parámetro 'destino'
    const bannerActual = DESTINO_BANNERS[destino.toLowerCase()] || DESTINO_BANNERS.default;

    return (
        <div className="bg-white min-h-screen font-sans">
            
            {/* --- SECCIÓN HERO BANNER DINÁMICO --- */}
            {/* Ajustado a w-full y h-auto */}
            <div className="w-full">
                <img 
                    src={bannerActual} 
                    alt={`Banner de ${nombreDestino}`}
                    className="w-full h-auto block"
                />
            </div>

            {/* Título de Sección */}
            <div className="text-center py-12 px-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#001f6c] uppercase tracking-tight">
                    HOTELES EN <span className="text-[#ed6f00]">{nombreDestino}</span>
                </h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">
                    Explora nuestra selección exclusiva de hospedajes
                </p>
            </div>

            <main className="max-w-7xl mx-auto px-6 pb-20">
                {hoteles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hoteles.map((hotel) => (
                            <PromoCard 
                                key={hotel.accommodation_ID}
                                image={getImageUrl(hotel.post?.thumbnail)}
                                title={hotel.post?.name}
                                subtitle={`${hotel.stars} Estrellas • ${hotel.destination}`}
                                priceLabel="Desde"
                                priceValue={`$${hotel.starting_price}`}
                                ctaLabel="Ver Detalles"
                                link={`/hotel/${hotel.accommodation_ID}`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <Icons.Buildings size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-gray-400 font-bold uppercase tracking-widest">No hay hoteles disponibles en {nombreDestino}</h3>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 text-[#ed6f00] font-bold text-sm underline hover:text-[#001f6c] transition-colors"
                        >
                            Ver otros destinos
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DestinoDetailView;