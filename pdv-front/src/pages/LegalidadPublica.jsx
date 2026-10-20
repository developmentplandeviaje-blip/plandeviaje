import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ShieldCheck,
    LockKey,
    CaretLeft,
    CaretRight,
    MagnifyingGlassPlus,
    Play,
    House,
    SealCheck,
    Info,
    WarningOctagon
} from '@phosphor-icons/react';
import { getLegalidadPublic } from '../api/legalidad';
import { getImageUrl } from '../utils/imageHandler';
import ImageLightbox from '../components/detail/ImageLightbox';
import nosotrosBanner from '../assets/nosotros.png';

const LegalidadPublica = () => {
    const { token } = useParams();

    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [data, setData] = useState(null);

    // Carousel state
    const [activeIndex, setActiveIndex] = useState(0);

    // Lightbox zoom state
    const [lightbox, setLightbox] = useState({ open: false, start: 0 });

    // Toast de advertencia de protección anti-copia
    const showProtectedToast = () => {
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'info',
            title: 'Contenido legal protegido contra copias',
            showConfirmButton: false,
            timer: 2000,
            background: '#001f6c',
            color: '#ffffff',
            iconColor: '#ed6f00',
        });
    };

    // Bloqueo de atajos de teclado y clic derecho (Anti-copia)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;

            // Bloquear Ctrl+C / Cmd+C (Copiar)
            if (isCtrlOrMeta && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                showProtectedToast();
                return false;
            }

            // Bloquear Ctrl+U / Cmd+U (Ver código fuente)
            if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                showProtectedToast();
                return false;
            }

            // Bloquear Ctrl+S (Guardar página)
            if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                showProtectedToast();
                return false;
            }

            // Bloquear Ctrl+P (Imprimir)
            if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                showProtectedToast();
                return false;
            }

            // Bloquear F12 (Herramientas de desarrollador)
            if (e.key === 'F12') {
                e.preventDefault();
                showProtectedToast();
                return false;
            }

            // Bloquear Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
                e.preventDefault();
                showProtectedToast();
                return false;
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            showProtectedToast();
            return false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Cargar información mediante token
    useEffect(() => {
        const fetchPublicData = async () => {
            if (!token) {
                setUnauthorized(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await getLegalidadPublic(token);
                if (res.success && res.data) {
                    setData(res.data);
                    setActiveIndex(0);
                    setUnauthorized(false);
                } else {
                    setUnauthorized(true);
                }
            } catch (err) {
                console.error('Error al verificar enlace:', err);
                setUnauthorized(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, [token]);

    // Navegación de carrusel
    const imagenesList = data?.imagenes || [];
    const totalImages = imagenesList.length;

    const nextSlide = () => {
        if (totalImages <= 1) return;
        setActiveIndex((prev) => (prev + 1) % totalImages);
    };

    const prevSlide = () => {
        if (totalImages <= 1) return;
        setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    // Formateador de título para resaltar "MÁS QUE VIAJAR!" en naranja
    const renderFormattedTitle = (rawTitle) => {
        if (!rawTitle) return null;
        if (rawTitle.includes('MÁS QUE VIAJAR!')) {
            const parts = rawTitle.split('MÁS QUE VIAJAR!');
            return (
                <>
                    {parts[0]}
                    <span className="text-[#ed6f00]">MÁS QUE VIAJAR!</span>
                    {parts[1] || ''}
                </>
            );
        }
        return rawTitle;
    };

    // Separador de párrafos para el texto descriptivo
    const renderParagraphs = (rawText) => {
        if (!rawText) return null;
        const paragraphs = rawText.split(/\n\s*\n/).filter(Boolean);
        return paragraphs.map((p, idx) => (
            <p
                key={idx}
                className={`text-sm sm:text-base md:text-lg text-[#001f6c] font-medium leading-relaxed ${
                    idx % 2 === 1 ? 'md:text-right' : 'md:text-left'
                }`}
            >
                {p.trim()}
            </p>
        ));
    };

    // Si está cargando
    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-14 h-14 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-base font-semibold text-[#001f6c]">Verificando credenciales de acceso...</p>
            </div>
        );
    }

    // Si el token es inválido o no autorizado
    if (unauthorized || !data) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <LockKey size={48} weight="fill" />
                    </div>

                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
                            Acceso Restringido
                        </span>
                        <h2 className="text-2xl font-extrabold text-[#001f6c] tracking-tight">
                            Enlace No Válido o Expirado
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            Este documento o certificación solo está disponible mediante un enlace exclusivo emitido por Plan de Viaje.
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-left text-xs text-amber-900 flex items-start gap-3">
                        <WarningOctagon size={20} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                        <p>
                            Si considera que esto es un error, por favor comuníquese con su asesor de viajes o con el equipo de Atención al Cliente para solicitar un enlace actualizado.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#001f6c] text-white font-bold text-sm hover:bg-[#001f6c]/90 transition shadow-md active:scale-95"
                    >
                        <House size={18} weight="bold" /> Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const imageURLsList = imagenesList.map((img) => getImageUrl(img.ruta_imagen));

    return (
        <div className="select-none font-sans bg-white pb-20 text-[#001f6c] relative overflow-hidden" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            {/* CSS Print killer to prevent printing protected content */}
            <style>
                {`
                    @media print {
                        body { display: none !important; }
                    }
                    img {
                        -webkit-user-drag: none;
                        -khtml-user-drag: none;
                        -moz-user-drag: none;
                        -o-user-drag: none;
                        user-drag: none;
                    }
                `}
            </style>

            {/* BANNER SUPERIOR: FOTO DE EQUIPO (Boceto adjunto) */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-gray-100 max-h-[460px] relative">
                    <img
                        src={nosotrosBanner}
                        alt="Equipo Plan de Viaje"
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                    />
                </div>
            </div>

            {/* TÍTULO PRINCIPAL (Boceto adjunto) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mt-8 sm:mt-12 mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#001f6c] uppercase drop-shadow-xs">
                    {renderFormattedTitle(data.titulo)}
                </h1>
                <div className="h-1.5 w-24 bg-[#ed6f00] rounded-full mx-auto mt-4" />
            </div>

            {/* CARRUSEL DE IMÁGENES / CERTIFICADOS (Boceto adjunto con efecto central expandido) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
                {totalImages === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
                        <SealCheck size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-semibold">Documentación y certificaciones en proceso de carga.</p>
                    </div>
                ) : (
                    <div className="relative flex flex-col items-center">
                        {/* Contenedor del Carrusel Estilo Coverflow */}
                        <div className="w-full relative flex items-center justify-center py-6 sm:py-8 overflow-hidden">
                            {/* Botón Anterior (Flecha Circular Azul) */}
                            {totalImages > 1 && (
                                <button
                                    type="button"
                                    onClick={prevSlide}
                                    className="absolute left-2 sm:left-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border-2 border-white focus:outline-none"
                                    aria-label="Imagen anterior"
                                >
                                    <CaretLeft size={28} weight="bold" />
                                </button>
                            )}

                            {/* Tarjetas del Carrusel */}
                            <div className="relative flex items-center justify-center w-full min-h-[300px] sm:min-h-[400px]">
                                {imagenesList.map((item, idx) => {
                                    const fullUrl = getImageUrl(item.ruta_imagen);
                                    const isCenter = idx === activeIndex;
                                    const isPrev = idx === (activeIndex - 1 + totalImages) % totalImages;
                                    const isNext = idx === (activeIndex + 1) % totalImages;

                                    if (!isCenter && !isPrev && !isNext && totalImages > 3) {
                                        return null;
                                    }

                                    let positionClass = '';
                                    if (isCenter) {
                                        positionClass = 'z-20 scale-100 opacity-100 translate-x-0 cursor-pointer shadow-2xl';
                                    } else if (isPrev) {
                                        positionClass = 'z-10 scale-85 opacity-70 -translate-x-[45%] sm:-translate-x-[40%] cursor-pointer';
                                    } else if (isNext) {
                                        positionClass = 'z-10 scale-85 opacity-70 translate-x-[45%] sm:translate-x-[40%] cursor-pointer';
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                if (isCenter) {
                                                    setLightbox({ open: true, start: idx });
                                                } else {
                                                    setActiveIndex(idx);
                                                }
                                            }}
                                            className={`absolute transition-all duration-500 ease-out w-[270px] sm:w-[360px] md:w-[420px] aspect-[4/3] rounded-3xl overflow-hidden bg-white border-4 border-white ${positionClass}`}
                                            title="Clic para ampliar y hacer zoom"
                                        >
                                            <img
                                                src={fullUrl}
                                                alt={`Certificado o Documento ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-2xl pointer-events-none"
                                            />

                                            {/* Overlay zoom hint al pasar el ratón en la activa */}
                                            {isCenter && (
                                                <div className="absolute inset-0 bg-black/25 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-sm rounded-2xl backdrop-blur-[2px]">
                                                    <MagnifyingGlassPlus size={24} weight="bold" />
                                                    <span>Clic para ampliar</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Botón Siguiente (Flecha Circular Azul) */}
                            {totalImages > 1 && (
                                <button
                                    type="button"
                                    onClick={nextSlide}
                                    className="absolute right-2 sm:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border-2 border-white focus:outline-none"
                                    aria-label="Siguiente imagen"
                                >
                                    <CaretRight size={28} weight="bold" />
                                </button>
                            )}
                        </div>

                        {/* Indicadores de posición / Dots */}
                        {totalImages > 1 && (
                            <div className="flex items-center gap-2 mt-4">
                                {imagenesList.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        type="button"
                                        onClick={() => setActiveIndex(dotIdx)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            dotIdx === activeIndex ? 'w-8 bg-[#ed6f00]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Ir a documento ${dotIdx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        <p className="text-[11px] sm:text-xs text-gray-400 mt-2 flex items-center gap-1 font-medium">
                            <MagnifyingGlassPlus size={14} className="text-[#ed6f00]" />
                            Haz clic sobre cualquier imagen para inspeccionar y hacer zoom en alta resolución.
                        </p>
                    </div>
                )}
            </div>

            {/* SECCIÓN INFERIOR: REPRODUCTOR DE VIDEO (Izquierda) + TEXTO DESCRIPTIVO (Derecha) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* COLUMNA IZQUIERDA: REPRODUCTOR DE VIDEO */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="w-full max-w-md aspect-square rounded-[36px] overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-[#001f6c] p-2.5 shadow-2xl relative group">
                            <div className="w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center relative">
                                {data.url_video ? (
                                    data.url_video.includes('youtube.com') || data.url_video.includes('youtu.be') ? (
                                        <iframe
                                            src={
                                                data.url_video.includes('watch?v=')
                                                    ? `https://www.youtube.com/embed/${data.url_video.split('watch?v=')[1]?.split('&')[0]}?rel=0`
                                                    : data.url_video.includes('youtu.be/')
                                                    ? `https://www.youtube.com/embed/${data.url_video.split('youtu.be/')[1]}?rel=0`
                                                    : data.url_video
                                            }
                                            title="Video Corporativo Plan de Viaje"
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={getImageUrl(data.url_video)}
                                            controls
                                            playsInline
                                            controlsList="nodownload"
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="text-center p-8 space-y-3">
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-[#ed6f00] shadow-lg">
                                            <Play size={40} weight="fill" className="ml-1" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-white/80 font-medium">
                                            Video corporativo e institucional
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: TEXTO INFORMATIVO (Boceto adjunto) */}
                    <div className="lg:col-span-7 space-y-6">
                        {renderParagraphs(data.texto)}

                        <div className="pt-4 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200/80 text-[#ed6f00] text-xs font-bold">
                                <SealCheck size={18} weight="fill" />
                                <span>Agencia Certificada • RTN y Licencia VT Vigente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX MODAL PARA ZOOM Y EXPANSIÓN */}
            {lightbox.open && (
                <ImageLightbox
                    images={imageURLsList}
                    startAt={lightbox.start}
                    onClose={() => setLightbox({ open: false, start: 0 })}
                />
            )}
        </div>
    );
};

export default LegalidadPublica;
