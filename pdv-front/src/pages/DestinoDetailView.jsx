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
                    <div className="grid grid-cols-1 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {hoteles.map((hotel) => (
                            <div key={hotel.accommodation_ID} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group transition-all hover:shadow-2xl hover:-translate-y-1">
                                
                                {/* Imagen del Hotel - Proporción compacta que imita el tamaño del carrusel */}
                                <div className="relative aspect-square overflow-hidden shrink-0">
                                    <img 
                                        src={getImageUrl(hotel.post?.thumbnail)} 
                                        alt={hotel.post?.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="text-white text-[9px] font-bold uppercase tracking-widest bg-[#ed6f00] px-2 py-0.5 rounded-full shadow-lg">
                                            {hotel.stars} ESTRELLAS
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido de la Tarjeta - Estructura original 100% preservada pero a escala reducida */}
                                <div className="p-4 flex flex-col flex-1 w-full">
                                    <div className="flex justify-between items-start mb-3 w-full">
                                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                                            <h4 className="text-[#001f6c] font-extrabold text-sm leading-tight truncate">
                                                {hotel.post?.name}
                                            </h4>
                                            <p className="text-gray-400 text-[10px] mt-1 flex items-center gap-1 truncate font-medium">
                                                <Icons.MapPin size={10} weight="fill" className="text-[#ed6f00]" /> {hotel.destination}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md shrink-0">
                                            <Icons.Star size={11} weight="fill" className="text-yellow-400" />
                                            <span className="text-[10px] font-bold text-[#001f6c]">{hotel.stars}</span>
                                        </div>
                                    </div>

                                    {/* Badges de beneficios originales - Adaptados al nuevo ancho */}
                                    <div className="flex gap-2 mb-4 w-full">
                                        <div className="flex-1 bg-orange-50 rounded-lg py-1.5 flex flex-col items-center border border-orange-100">
                                            <Icons.User size={14} className="text-[#ed6f00] mb-0.5" />
                                            <span className="text-[8px] font-bold text-[#ed6f00] uppercase text-center px-0.5 leading-none">Por persona</span>
                                        </div>
                                        <div className="flex-1 bg-blue-50 rounded-lg py-1.5 flex flex-col items-center border border-blue-100">
                                            <Icons.Sun size={14} className="text-[#001f6c] mb-0.5" />
                                            <span className="text-[8px] font-bold text-[#001f6c] uppercase text-center px-0.5 leading-none">Por noche</span>
                                        </div>
                                    </div>

                                    {/* Footer de tarjeta: Precio + CTA */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto w-full">
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Desde</p>
                                            <p className="text-base font-black text-[#001f6c] leading-none mt-1.5">${hotel.starting_price}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/hotel/${hotel.accommodation_ID}`)}
                                            className="bg-[#ed6f00] hover:bg-[#001f6c] text-white px-4 py-2.5 rounded-xl font-bold text-[10px] transition-all shadow-md uppercase tracking-wider active:scale-95 whitespace-nowrap"
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