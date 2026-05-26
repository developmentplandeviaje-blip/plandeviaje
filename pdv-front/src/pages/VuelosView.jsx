import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import * as Icons from '@phosphor-icons/react';
import bannerVuelo from '../assets/bannervuelo.jpg'; 

const VuelosView = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        destino: '',
        precioMax: '',
        tipoViaje: 'Todos' 
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                setLoading(true);
                const res = await api.get('/flights');
                setFlights(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error cargando vuelos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlights();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredFlights = flights.filter(f => {
        const matchesDestino = !filters.destino || 
            f.destination?.toLowerCase().includes(filters.destino.toLowerCase());
        
        const matchesPrecio = !filters.precioMax || 
            Number(f.starting_price) <= Number(filters.precioMax);
        
        const matchesTipo = filters.tipoViaje === 'Todos' || 
            f.trip_type === filters.tipoViaje; 

        return matchesDestino && matchesPrecio && matchesTipo;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#001f6c] border-t-[#ed6f00] rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-[#f8f9fb] min-h-screen flex flex-col font-sans">
            
            {/* Hero Banner Section */}
            <header className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <img 
                    src={bannerVuelo || null} 
                    alt="Banner de Vuelos" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            </header>

            {/* Floating Filter Bar */}
            <section className="relative z-20 -mt-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-3 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3 px-4 text-gray-400">
                                <Icons.MagnifyingGlass size={22} weight="bold" className="text-[#001f6c]" />
                                <span className="text-sm font-semibold text-gray-500 hidden sm:inline">
                                    ¿A dónde quieres volar hoy?
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 bg-[#001f6c] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all hover:bg-[#ed6f00] tracking-wider shadow-md"
                            >
                                <Icons.FadersHorizontal size={18} />
                                {isFilterOpen ? 'CERRAR' : 'FILTRAR BÚSQUEDA'}
                            </button>
                        </div>

                        {/* Expandable Filter Menu */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[500px] border-t border-gray-100' : 'max-h-0'}`}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">Destino</label>
                                    <input 
                                        name="destino"
                                        value={filters.destino}
                                        onChange={handleFilterChange}
                                        placeholder="Ej: Margarita, Madrid..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed6f00] outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">Precio Máximo ($)</label>
                                    <input 
                                        name="precioMax"
                                        type="number"
                                        value={filters.precioMax}
                                        onChange={handleFilterChange}
                                        placeholder="Cualquier precio"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed6f00] outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">Tipo de Viaje</label>
                                    <select 
                                        name="tipoViaje"
                                        value={filters.tipoViaje}
                                        onChange={handleFilterChange}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed6f00] outline-none font-medium appearance-none"
                                    >
                                        <option value="Todos">Todos los tipos</option>
                                        <option value="Ida">Solo Ida</option>
                                        <option value="Ida y Vuelta">Ida y Vuelta</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Title Section */}
            <div className="text-center pt-16 px-6">
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#001f6c] uppercase leading-tight tracking-tighter">
                    RESERVA TU <span className="text-[#ed6f00]">VUELO</span>
                </h2>
                <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-3">
                    Las mejores tarifas para tu próximo destino
                </p>

                <div className="h-1.5 w-24 bg-[#ed6f00] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Main Content: Flight Cards */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {filteredFlights.length > 0 ? (
                    <div className="grid grid-cols-1 min-[440px]:grid-cols-2 min-[680px]:grid-cols-3 min-[960px]:grid-cols-4 gap-6">
                        {/* El error ocurría aquí por la posición del comentario. Ahora está dentro del div. */}
                        {filteredFlights.map((flight) => {
                            const imgSource = getImageUrl(flight.post?.thumbnail || flight.post?.banner);
                            
                            return (
                                <div key={flight.flights_ID} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                    
                                    {/* Card Image */}
                                    <div className="relative h-60 overflow-hidden">
                                        <img 
                                            src={imgSource || null} 
                                            alt={flight.post?.name || 'Vuelo'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full shadow-sm">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Promo</span>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Icons.MapPin size={14} weight="fill" className="text-[#ed6f00]" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {flight.destination}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-[#001f6c] mb-3 line-clamp-1">
                                            {flight.post?.name || `Vuelo a ${flight.destination}`}
                                        </h3>

                                        <div className="flex gap-2 mb-5">
                                            <div className="flex-1 bg-gray-50 rounded-xl py-2 flex flex-col items-center justify-center border border-gray-50">
                                                <Icons.User size={16} className="text-[#001f6c] mb-0.5" />
                                                <span className="text-[8px] font-bold text-[#001f6c] uppercase">Por persona</span>
                                            </div>
                                            
                                            <div className="flex-1 bg-gray-50 rounded-xl py-2 flex flex-col items-center justify-center border border-gray-50 text-center px-1">
                                                {flight.trip_type === 'Ida y Vuelta' ? (
                                                    <Icons.ArrowsClockwise size={16} className="text-[#001f6c] mb-0.5" />
                                                ) : (
                                                    <Icons.AirplaneTilt size={16} className="text-[#001f6c] mb-0.5" />
                                                )}
                                                <span className="text-[8px] font-bold text-[#001f6c] uppercase">
                                                    {flight.trip_type || 'Ida y Vuelta'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Desde</p>
                                                <p className="text-2xl font-black text-[#001f6c] tracking-tighter">
                                                    ${flight.starting_price}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/vuelo/${flight.flights_ID}`)}
                                                className="bg-[#ed6f00] hover:bg-[#001f6c] text-white px-6 py-3 rounded-xl font-bold text-[10px] tracking-widest transition-all shadow-md active:scale-95 uppercase"
                                            >
                                                RESERVAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32">
                        <div className="bg-white inline-block p-10 rounded-[3rem] shadow-sm border border-gray-100">
                            <Icons.CloudSlash size={80} weight="light" className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-lg">
                                No se encontraron vuelos disponibles
                            </h3>
                            <p className="text-gray-300 text-sm mt-2 font-medium">Prueba ajustando los filtros de búsqueda</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VuelosView;