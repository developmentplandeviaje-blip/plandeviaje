import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import * as Icons from '@phosphor-icons/react';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hoteles.map((hotel) => (
                            <div key={hotel.accommodation_ID} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group transition-all hover:shadow-2xl hover:-translate-y-1">
                                
                                {/* Imagen del Hotel */}
                                <div className="relative h-64 overflow-hidden">
                                    <img 
                                        src={getImageUrl(hotel.post?.thumbnail)} 
                                        alt={hotel.post?.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#ed6f00] px-3 py-1 rounded-full shadow-lg">
                                            {hotel.stars} ESTRELLAS
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido de la Tarjeta */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <h4 className="text-[#001f6c] font-extrabold text-lg leading-tight">
                                                {hotel.post?.name}
                                            </h4>
                                            <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                                                <Icons.MapPin size={12} weight="fill" className="text-[#ed6f00]" /> {hotel.destination}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Icons.Star size={14} weight="fill" className="text-yellow-400" />
                                            <span className="text-xs font-bold text-[#001f6c]">{hotel.stars}</span>
                                        </div>
                                    </div>

                                    {/* Badges de beneficios */}
                                    <div className="flex gap-2 mb-6">
                                        <div className="flex-1 bg-orange-50 rounded-xl py-2 flex flex-col items-center border border-orange-100">
                                            <Icons.User size={16} className="text-[#ed6f00] mb-1" />
                                            <span className="text-[9px] font-bold text-[#ed6f00] uppercase text-center px-1">Por persona</span>
                                        </div>
                                        <div className="flex-1 bg-blue-50 rounded-xl py-2 flex flex-col items-center border border-blue-100">
                                            <Icons.Sun size={16} className="text-[#001f6c] mb-1" />
                                            <span className="text-[9px] font-bold text-[#001f6c] uppercase text-center px-1">Por noche</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Desde</p>
                                            <p className="text-xl font-black text-[#001f6c]">${hotel.starting_price}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/hotel/${hotel.accommodation_ID}`)}
                                            className="bg-[#ed6f00] hover:bg-[#001f6c] text-white px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-md uppercase tracking-wider active:scale-95"
                                        >
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
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