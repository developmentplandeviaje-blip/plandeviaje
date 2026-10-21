import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ShieldCheck,
    LockKey,
    CaretLeft,
    CaretRight,
    MagnifyingGlassPlus,
    Play,
    Pause,
    SpeakerHigh,
    SpeakerLow,
    SpeakerSlash,
    CornersOut,
    CornersIn,
    House,
    SealCheck,
    Info,
    WarningOctagon
} from '@phosphor-icons/react';
import { getLegalidadPublic } from '../api/legalidad';
import { getImageUrl } from '../utils/imageHandler';
import ImageLightbox from '../components/detail/ImageLightbox';
import nosotrosBanner from '../assets/nosotros.png';

/**
 * Reproductor de video corporativo personalizado:
 * - Soporta imagen de portada (poster/carátula) antes de iniciar la reproducción.
 * - Adapta su relación de aspecto al video para no cortar información ni recortar los bordes.
 * - Barra de reproducción y controles integrados con la paleta de la web (azul #001f6c y naranja #ed6f00).
 */
const CorporateVideoPlayer = ({ src, poster, onProtectedAction }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPos, setHoverPos] = useState(0);

    const controlsTimeoutRef = useRef(null);

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleSeek = (e) => {
        if (!videoRef.current || !progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newTime = (clickX / rect.width) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleProgressMouseMove = (e) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const time = (moveX / rect.width) * duration;
        setHoverTime(time);
        setHoverPos((moveX / rect.width) * 100);
    };

    const handleProgressMouseLeave = () => {
        setHoverTime(null);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const handleVolumeChange = (e) => {
        const newVol = parseFloat(e.target.value);
        if (!videoRef.current) return;
        videoRef.current.volume = newVol;
        setVolume(newVol);
        if (newVol === 0) {
            videoRef.current.muted = true;
            setIsMuted(true);
        } else if (isMuted) {
            videoRef.current.muted = false;
            setIsMuted(false);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    };

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        } else {
            resetControlsTimeout();
        }
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onContextMenu={(e) => {
                e.preventDefault();
                onProtectedAction?.();
            }}
            className="w-full max-w-xl mx-auto rounded-[28px] p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 via-blue-600 to-[#001f6c] shadow-2xl relative group select-none transition-all duration-300"
        >
            <div className="relative w-full rounded-[20px] overflow-hidden bg-black flex items-center justify-center">
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster || undefined}
                    playsInline
                    controls={false}
                    controlsList="nodownload"
                    disablePictureInPicture
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-auto max-h-[580px] object-contain block mx-auto cursor-pointer"
                />

                {/* Carátula / Poster overlay cuando el video no ha iniciado la reproducción */}
                {poster && !isPlaying && currentTime === 0 && (
                    <img
                        src={poster}
                        alt="Portada del video"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />
                )}

                {/* Botón flotante central de Play cuando está en pausa */}
                {!isPlaying && (
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#001f6c]/80 hover:bg-[#ed6f00] text-white shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group/btn cursor-pointer z-20 border-2 border-white/40"
                        aria-label="Reproducir video"
                    >
                        <Play size={44} weight="fill" className="ml-1.5 transition-transform group-hover/btn:scale-110" />
                    </button>
                )}

                {/* Barra de Controles Personalizada adaptada al entorno de la página */}
                <div
                    className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 px-4 pt-8 pb-3 bg-gradient-to-t from-[#001f6c]/95 via-[#001f6c]/80 to-transparent backdrop-blur-[2px] ${
                        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
                >
                    {/* Barra de Progreso Personalizada (Línea de Tiempo) */}
                    <div
                        ref={progressRef}
                        onClick={handleSeek}
                        onMouseMove={handleProgressMouseMove}
                        onMouseLeave={handleProgressMouseLeave}
                        className="relative w-full h-2 hover:h-3 bg-white/25 hover:bg-white/35 rounded-full cursor-pointer transition-all duration-200 mb-3 flex items-center group/timeline"
                    >
                        {/* Tooltip de tiempo en hover */}
                        {hoverTime !== null && (
                            <div
                                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#001f6c] text-white text-[11px] font-mono font-bold shadow-lg border border-white/20 pointer-events-none"
                                style={{ left: `${hoverPos}%` }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}

                        {/* Progreso en Naranja Corporativo (#ed6f00) */}
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-[#ed6f00] rounded-full relative transition-all duration-75"
                            style={{ width: `${progressPercent}%` }}
                        >
                            {/* Mango / Indicador circular */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#ed6f00] rounded-full shadow-lg opacity-90 group-hover/timeline:scale-125 transition-transform" />
                        </div>
                    </div>

                    {/* Fila de Botones: Play/Pause, Volumen, Tiempo, Pantalla Completa */}
                    <div className="flex items-center justify-between text-white gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={togglePlay}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ed6f00] text-white flex items-center justify-center transition-colors shadow-sm focus:outline-none cursor-pointer"
                                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                            >
                                {isPlaying ? (
                                    <Pause size={18} weight="fill" />
                                ) : (
                                    <Play size={18} weight="fill" className="ml-0.5" />
                                )}
                            </button>

                            {/* Control de Volumen y Mute */}
                            <div className="flex items-center gap-1.5 group/vol">
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="w-9 h-9 rounded-full hover:bg-white/15 text-white/90 hover:text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                                >
                                    {isMuted || volume === 0 ? (
                                        <SpeakerSlash size={20} weight="fill" className="text-red-400" />
                                    ) : volume < 0.5 ? (
                                        <SpeakerLow size={20} weight="fill" />
                                    ) : (
                                        <SpeakerHigh size={20} weight="fill" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-14 sm:w-20 h-1.5 accent-[#ed6f00] bg-white/30 rounded-full cursor-pointer transition-all"
                                    aria-label="Ajustar volumen"
                                />
                            </div>

                            {/* Reloj Tiempo Actual / Total */}
                            <span className="text-xs sm:text-sm font-semibold text-white/90 font-mono tracking-wider ml-1">
                                {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                            </span>
                        </div>

                        {/* Botón Pantalla Completa */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="w-9 h-9 rounded-full hover:bg-white/15 text-white/90 hover:text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                            >
                                {isFullscreen ? (
                                    <CornersIn size={20} weight="bold" />
                                ) : (
                                    <CornersOut size={20} weight="bold" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    // Formateador de título para resaltar "MÁS QUE VIAJAR!" en naranja y mantener en una sola línea
    const renderFormattedTitle = (rawTitle) => {
        if (!rawTitle) return null;
        if (rawTitle.includes('MÁS QUE VIAJAR!')) {
            const parts = rawTitle.split('MÁS QUE VIAJAR!');
            return (
                <>
                    <span className="text-[#001f6c]">{parts[0]}</span>
                    <span className="text-[#ed6f00]">MÁS QUE VIAJAR!</span>
                    {parts[1] ? <span className="text-[#001f6c]">{parts[1]}</span> : null}
                </>
            );
        }
        return <span className="text-[#001f6c]">{rawTitle}</span>;
    };

    // Separador de párrafos para el texto descriptivo
    const renderParagraphs = (rawText) => {
        if (!rawText) return null;
        const paragraphs = rawText.split(/\n\s*\n/).filter(Boolean);
        return paragraphs.map((p, idx) => (
            <p
                key={idx}
                className="text-sm sm:text-base md:text-lg text-[#001f6c] font-medium leading-relaxed text-left"
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
        <div className="select-none font-sans bg-transparent pb-20 text-[#001f6c] relative overflow-hidden" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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

            {/* SECCIÓN HERO BANNER: EQUIPO PLAN DE VIAJE (Referencia vista Nosotros) */}
            <div className="w-full">
                <img
                    src={nosotrosBanner}
                    alt="Nosotros - Plan de Viaje"
                    className="w-full h-auto block select-none pointer-events-none"
                    loading="eager"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                />
            </div>

            {/* TÍTULO / ESLOGAN EN UNA SOLA LÍNEA (Referencia vista Nosotros) */}
            <div className="w-full max-w-7xl mx-auto px-4 text-center mt-6 sm:mt-10 mb-8 sm:mb-12">
                <h1 className="text-base sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[40px] font-black uppercase tracking-tight whitespace-nowrap">
                    {renderFormattedTitle(data.titulo)}
                </h1>
                <div className="h-1.5 w-24 bg-[#ed6f00] rounded-full mx-auto mt-3 sm:mt-4" />
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
                    {/* COLUMNA IZQUIERDA: REPRODUCTOR DE VIDEO ADAPTABLE */}
                    <div className="lg:col-span-6 flex justify-center w-full">
                        {data.url_video ? (
                            data.url_video.includes('youtube.com') || data.url_video.includes('youtu.be') ? (
                                <div className="w-full max-w-xl mx-auto rounded-[28px] p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 via-blue-600 to-[#001f6c] shadow-2xl relative">
                                    <div className="w-full aspect-video rounded-[20px] overflow-hidden bg-black flex items-center justify-center relative">
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
                                    </div>
                                </div>
                            ) : (
                                <CorporateVideoPlayer
                                    src={getImageUrl(data.url_video)}
                                    poster={data.portada_video ? getImageUrl(data.portada_video) : undefined}
                                    onProtectedAction={showProtectedToast}
                                />
                            )
                        ) : (
                            <div className="w-full max-w-xl aspect-video rounded-[28px] p-2.5 bg-gradient-to-br from-blue-500 via-blue-600 to-[#001f6c] shadow-2xl flex items-center justify-center">
                                <div className="w-full h-full rounded-[20px] bg-black/80 flex flex-col items-center justify-center p-8 space-y-3 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[#ed6f00] shadow-lg">
                                        <Play size={36} weight="fill" className="ml-1" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                                        Video corporativo e institucional en configuración
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: TEXTO INFORMATIVO (Boceto adjunto) */}
                    <div className="lg:col-span-6 space-y-6">
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
