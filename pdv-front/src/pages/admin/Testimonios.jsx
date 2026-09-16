import React, { useState, useEffect } from 'react';
import { getTestimonios, deleteTestimonio } from '../../api/testimonios';
import Swal from 'sweetalert2';
import {
    Copy,
    Check,
    Star,
    ThumbsUp,
    ThumbsDown,
    ChatText,
    Trash,
    MagnifyingGlass,
    UserCheck,
    Sparkle,
    Tag,
    ArrowClockwise
} from '@phosphor-icons/react';

const Testimonios = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        metrics: {
            total_respuestas: 0,
            promedio_general: 0,
            promedios_desglose: {
                atencion: 0,
                atencion_representante: 0,
                itinerario: 0,
                calidad: 0,
                experiencia: 0,
            },
            porcentaje_desempeno_ventas: 0,
            porcentaje_recomendacion: 0,
            porcentaje_fidelidad: 0,
        },
        testimonios: {
            data: [],
            total: 0,
            current_page: 1,
            last_page: 1,
        },
    });

    const [filter, setFilter] = useState('all'); // all, low, comments
    const [search, setSearch] = useState('');
    const [copiedLink, setCopiedLink] = useState(false);
    const [customRef, setCustomRef] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);

    const publicBaseUrl = `${window.location.origin}/evaluar-experiencia`;

    const fetchTestimonios = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getTestimonios({
                page,
                filter,
                search,
            });
            setData(res);
        } catch (err) {
            console.error('Error al cargar testimonios:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos de testimonios.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonios();
    }, [filter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchTestimonios(1);
    };

    const handleCopyPublicUrl = (urlToCopy = publicBaseUrl) => {
        navigator.clipboard.writeText(urlToCopy);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '¡Enlace copiado al portapapeles!',
            showConfirmButton: false,
            timer: 2000,
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar este testimonio?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                await deleteTestimonio(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El testimonio fue eliminado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchTestimonios(data.testimonios.current_page);
            } catch (err) {
                console.error('Error al eliminar:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el testimonio.',
                });
            }
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={14}
                        weight={s <= rating ? 'fill' : 'regular'}
                        className={s <= rating ? 'text-amber-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    const metrics = data.metrics || {};
    const testimoniosList = data.testimonios?.data || [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Header section with Title & Copy Link Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c] tracking-tight">
                        Testimonios y Experiencias de Viaje
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Panel de analítica y retroalimentación recibida por los pasajeros.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => fetchTestimonios(data.testimonios?.current_page || 1)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#001f6c]/10 text-[#001f6c] hover:bg-[#001f6c]/20 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                        title="Actualizar información de la vista"
                    >
                        <ArrowClockwise size={18} weight="bold" className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>

                    <button
                        onClick={() => setShowLinkModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-[#001f6c] hover:bg-gray-200 text-sm font-semibold rounded-xl transition-all"
                    >
                        <Sparkle size={18} weight="fill" className="text-[#ed6f00]" /> Generar Enlace con Ref
                    </button>

                    <button
                        onClick={() => handleCopyPublicUrl()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#ed6f00] text-white hover:bg-[#ed6f00]/90 text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
                    >
                        {copiedLink ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
                        {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Cuestionario'}
                    </button>
                </div>
            </div>

            {/* KPI OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-[#001f6c] to-[#0034a8] text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
                    <div className="absolute top-3 right-3 opacity-10">
                        <Star size={70} weight="fill" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">
                        Promedio General
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight">
                            {metrics.promedio_general || '0.0'}
                        </span>
                        <span className="text-xs text-blue-200 font-semibold">/ 5.0</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        {renderStars(Math.round(metrics.promedio_general || 0))}
                        <span className="text-[11px] text-blue-100 font-medium">
                            ({metrics.total_respuestas})
                        </span>
                    </div>
                </div>

                {/* Total Responses */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                            Total Respuestas
                        </span>
                        <div className="mt-2 text-3xl font-extrabold text-[#001f6c]">
                            {metrics.total_respuestas}
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">Encuestas recopiladas</p>
                </div>

                {/* % Info Excursiones / Ventas */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                Info Excursiones
                            </span>
                            <span className="p-1.5 bg-orange-50 text-[#ed6f00] rounded-lg">
                                <ThumbsUp size={16} weight="fill" />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-[#ed6f00]">
                            {metrics.porcentaje_desempeno_ventas}%
                        </div>
                    </div>
                    <div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-[#ed6f00] h-full rounded-full transition-all duration-500"
                                style={{ width: `${metrics.porcentaje_desempeno_ventas}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Sí: {metrics.conteo_desempeno_ventas?.si || 0}
                            </span>
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                No: {metrics.conteo_desempeno_ventas?.no || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* % Recommendation */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                Recomendación
                            </span>
                            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <ThumbsUp size={16} weight="fill" />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-emerald-600">
                            {metrics.porcentaje_recomendacion}%
                        </div>
                    </div>
                    <div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${metrics.porcentaje_recomendacion}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Sí: {metrics.conteo_recomendacion?.si || 0}
                            </span>
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                No: {metrics.conteo_recomendacion?.no || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* % Loyalty */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                Fidelidad
                            </span>
                            <span className="p-1.5 bg-blue-50 text-[#001f6c] rounded-lg">
                                <UserCheck size={16} weight="fill" />
                            </span>
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-[#001f6c]">
                            {metrics.porcentaje_fidelidad}%
                        </div>
                    </div>
                    <div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-[#001f6c] h-full rounded-full transition-all duration-500"
                                style={{ width: `${metrics.porcentaje_fidelidad}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Sí: {metrics.conteo_fidelidad?.si || 0}
                            </span>
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                No: {metrics.conteo_fidelidad?.no || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BREAKDOWN BY QUESTION SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-[#001f6c] mb-6 flex items-center gap-2">
                    <Star size={20} weight="fill" className="text-amber-400" /> Desglose por Pregunta de Evaluación
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        { label: 'Atención y Asesoría', value: metrics.promedios_desglose?.atencion || 0 },
                        { label: 'Atención Rep. Ventas (Hotel)', value: metrics.promedios_desglose?.atencion_representante || 0 },
                        { label: 'Cumplimiento Itinerario', value: metrics.promedios_desglose?.itinerario || 0 },
                        { label: 'Calidad de Servicios', value: metrics.promedios_desglose?.calidad || 0 },
                        { label: 'Experiencia General', value: metrics.promedios_desglose?.experiencia || 0 },
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-xs text-gray-800">{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                    {renderStars(Math.round(item.value))}
                                    <span className="font-bold text-xs text-[#001f6c]">{item.value} / 5.0</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#ed6f00] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(item.value / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COMMENTS & RESPONSES SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#001f6c] flex items-center gap-2">
                            <ChatText size={20} weight="fill" className="text-[#ed6f00]" /> Muro de Observaciones y Comentarios
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Revisa el detalle de opiniones ingresadas por los usuarios.
                        </p>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar en comentarios..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#001f6c]/20"
                            />
                            <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </form>

                        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filter === 'all' ? 'bg-white text-[#001f6c] shadow-sm font-bold' : 'hover:text-[#001f6c]'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter('low')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filter === 'low' ? 'bg-white text-rose-600 shadow-sm font-bold' : 'hover:text-rose-600'
                                }`}
                            >
                                ≤ 3 Estrellas
                            </button>
                            <button
                                onClick={() => setFilter('comments')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    filter === 'comments' ? 'bg-white text-[#ed6f00] shadow-sm font-bold' : 'hover:text-[#ed6f00]'
                                }`}
                            >
                                Con Comentarios
                            </button>
                        </div>
                    </div>
                </div>

                {/* List of Feedback */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="w-10 h-10 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Cargando respuestas...</p>
                    </div>
                ) : testimoniosList.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <ChatText size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-base font-bold text-gray-700">No se encontraron testimonios</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {search || filter !== 'all' ? 'Intenta modificar los filtros de búsqueda.' : 'Aún no se han recibido respuestas en el cuestionario.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testimoniosList.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                            >
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="text-gray-400 font-medium">
                                            {new Date(item.created_at).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>

                                        {item.referencia_viaje && (
                                            <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-[#ed6f00] rounded-md font-bold text-[11px]">
                                                Ref: {item.referencia_viaje}
                                            </span>
                                        )}

                                        <div className="flex flex-wrap items-center gap-1.5 ml-auto md:ml-0">
                                            {item.desempeno_ventas ? (
                                                <span className="px-2 py-0.5 bg-orange-50 text-[#ed6f00] font-bold rounded-md text-[11px] flex items-center gap-1 border border-orange-100">
                                                    <ThumbsUp size={12} weight="fill" /> Info Excursiones: Sí
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md text-[11px] flex items-center gap-1 border border-rose-100">
                                                    <ThumbsDown size={12} weight="fill" /> Info Excursiones: No
                                                </span>
                                            )}

                                            {item.recomendacion ? (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[11px] flex items-center gap-1 border border-emerald-100">
                                                    <ThumbsUp size={12} weight="fill" /> Recomendación: Sí
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md text-[11px] flex items-center gap-1 border border-rose-100">
                                                    <ThumbsDown size={12} weight="fill" /> Recomendación: No
                                                </span>
                                            )}

                                            {item.fidelidad ? (
                                                <span className="px-2 py-0.5 bg-blue-50 text-[#001f6c] font-bold rounded-md text-[11px] flex items-center gap-1 border border-blue-100">
                                                    <UserCheck size={12} weight="fill" /> Fidelidad: Sí
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md text-[11px] flex items-center gap-1 border border-rose-100">
                                                    <ThumbsDown size={12} weight="fill" /> Fidelidad: No
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ratings grid summary */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-3 rounded-xl border border-gray-100 text-xs">
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Atención Gral.</span>
                                            <span className="font-bold text-gray-800">★ {item.atencion_calificacion}/5</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Rep. Ventas</span>
                                            <span className="font-bold text-gray-800">★ {item.atencion_representante_calificacion}/5</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Itinerario</span>
                                            <span className="font-bold text-gray-800">★ {item.itinerario_calificacion}/5</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Calidad</span>
                                            <span className="font-bold text-gray-800">★ {item.calidad_calificacion}/5</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px]">Experiencia</span>
                                            <span className="font-bold text-gray-800">★ {item.experiencia_calificacion}/5</span>
                                        </div>
                                    </div>

                                    {/* Comment Content */}
                                    {item.comentarios ? (
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-xs sm:text-sm text-gray-800 italic whitespace-pre-line leading-relaxed">
                                            "{item.comentarios}"
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Sin observaciones escritas.</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end md:self-start"
                                    title="Eliminar testimonio"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* GENERATE CUSTOM REF LINK MODAL */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
                        <h3 className="text-lg font-bold text-[#001f6c]">Generar Enlace Personalizado</h3>
                        <p className="text-xs text-gray-500">
                            Introduce la referencia del viaje o reserva del pasajero para asociarla directamente al cuestionario.
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Referencia o Token (Opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. VIAJE-2026-001"
                                value={customRef}
                                onChange={(e) => setCustomRef(e.target.value)}
                                className="w-full p-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/20"
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-mono break-all text-gray-700">
                            {publicBaseUrl}{customRef ? `?ref=${encodeURIComponent(customRef)}` : ''}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={() => {
                                    const finalUrl = `${publicBaseUrl}${customRef ? `?ref=${encodeURIComponent(customRef)}` : ''}`;
                                    handleCopyPublicUrl(finalUrl);
                                    setShowLinkModal(false);
                                }}
                                className="px-5 py-2.5 bg-[#ed6f00] text-white font-bold text-xs rounded-xl hover:bg-[#ed6f00]/90 transition-all flex items-center gap-1.5"
                            >
                                <Copy size={16} /> Copiar Enlace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Testimonios;
