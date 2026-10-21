import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
    ShieldCheck,
    Copy,
    ArrowClockwise,
    ArrowSquareOut,
    UploadSimple,
    Trash,
    ArrowLeft,
    ArrowRight,
    VideoCamera,
    Image as ImageIcon,
    FileText,
    Check,
    Eye,
    Plus
} from '@phosphor-icons/react';
import {
    getLegalidadAdmin,
    updateLegalidad,
    regenerateLegalidadToken,
    uploadLegalidadImages,
    updateLegalidadImagesOrder,
    deleteLegalidadImage,
    uploadLegalidadVideo,
    uploadLegalidadPortadaVideo,
    deleteLegalidadPortadaVideo
} from '../../api/legalidad';
import { getImageUrl } from '../../utils/imageHandler';
import ImageLightbox from '../../components/detail/ImageLightbox';

const LegalidadVigencia = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [copied, setCopied] = useState(false);

    // Form fields
    const [id, setId] = useState(null);
    const [token, setToken] = useState('');
    const [titulo, setTitulo] = useState('¡SOMOS PLAN DE VIAJE, MÁS QUE VIAJAR!');
    const [texto, setTexto] = useState('');
    const [urlVideo, setUrlVideo] = useState('');
    const [portadaVideo, setPortadaVideo] = useState('');
    const [uploadingPortada, setUploadingPortada] = useState(false);
    const [imagenes, setImagenes] = useState([]);

    // Lightbox for previewing images
    const [lightbox, setLightbox] = useState({ open: false, start: 0 });

    const fileInputImagesRef = useRef(null);
    const fileInputVideoRef = useRef(null);
    const fileInputPortadaRef = useRef(null);

    // Public link
    const publicUrl = token ? `${window.location.origin}/legalidad/${token}` : '';

    const fetchLegalidad = async () => {
        setLoading(true);
        try {
            const res = await getLegalidadAdmin();
            if (res.success && res.data) {
                setId(res.data.id);
                setToken(res.data.token || '');
                setTitulo(res.data.titulo || '¡SOMOS PLAN DE VIAJE, MÁS QUE VIAJAR!');
                setTexto(res.data.texto || '');
                setUrlVideo(res.data.url_video || '');
                setPortadaVideo(res.data.portada_video || '');
                setImagenes(res.data.imagenes || []);
            }
        } catch (error) {
            console.error('Error al cargar datos de legalidad:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo cargar la configuración de Legalidad y Vigencia.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLegalidad();
    }, []);

    // Copiar enlace al portapapeles
    const handleCopyLink = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '¡Enlace público copiado al portapapeles!',
            showConfirmButton: false,
            timer: 2500,
        });
    };

    // Regenerar Token
    const handleRegenerateToken = async () => {
        const result = await Swal.fire({
            title: '¿Regenerar enlace único?',
            text: 'El enlace anterior dejará de funcionar y los usuarios necesitarán el nuevo enlace para acceder.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ed6f00',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, regenerar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const res = await regenerateLegalidadToken();
                if (res.success) {
                    setToken(res.token);
                    Swal.fire({
                        icon: 'success',
                        title: 'Enlace regenerado',
                        text: 'Se ha creado un nuevo enlace exclusivo.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }
            } catch (err) {
                console.error('Error al regenerar token:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo regenerar el enlace.',
                });
            }
        }
    };

    // Guardar cambios de texto y video
    const handleSaveContent = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const res = await updateLegalidad({
                titulo,
                texto,
                url_video: urlVideo,
                portada_video: portadaVideo,
            });
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'El contenido informativo y legal se actualizó con éxito.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            console.error('Error al guardar contenido:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: err.response?.data?.message || 'Ocurrió un error al guardar los cambios.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Subida múltiple de imágenes
    const handleSelectImages = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images[]', file);
        });

        setUploadingImages(true);
        try {
            const res = await uploadLegalidadImages(formData);
            if (res.success) {
                setImagenes(res.imagenes || []);
                Swal.fire({
                    icon: 'success',
                    title: 'Imágenes agregadas',
                    text: res.message,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            console.error('Error al subir imágenes:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: err.response?.data?.message || 'No se pudieron subir las imágenes seleccionadas.',
            });
        } finally {
            setUploadingImages(false);
            if (fileInputImagesRef.current) {
                fileInputImagesRef.current.value = '';
            }
        }
    };

    // Reordenamiento: mover imagen de posición (izquierda / derecha)
    const handleMoveImage = async (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= imagenes.length) return;

        const updated = [...imagenes];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        setImagenes(updated);

        try {
            const orderedIds = updated.map((img) => img.id);
            const res = await updateLegalidadImagesOrder(orderedIds);
            if (res.success && res.imagenes) {
                setImagenes(res.imagenes);
            }
        } catch (err) {
            console.error('Error al actualizar orden de imágenes:', err);
            // Revert on error
            fetchLegalidad();
        }
    };

    // Eliminar imagen del carrusel
    const handleDeleteImage = async (imgId) => {
        const result = await Swal.fire({
            title: '¿Eliminar imagen?',
            text: 'Esta imagen será retirada del carrusel de legalidad.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteLegalidadImage(imgId);
                if (res.success) {
                    setImagenes(res.imagenes || []);
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminada',
                        text: 'La imagen fue retirada del carrusel.',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                }
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la imagen.',
                });
            }
        }
    };

    // Subir archivo de video
    const handleUploadVideoFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño máximo en cliente (250MB)
        if (file.size > 250 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo muy grande',
                text: 'El video supera los 250MB. Para videos muy pesados, recomendamos usar la Opción A vinculando el enlace de YouTube o Vimeo.',
            });
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        setUploadingVideo(true);
        setUploadProgress(0);

        try {
            const res = await uploadLegalidadVideo(formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            if (res.success) {
                setUrlVideo(res.url);
                Swal.fire({
                    icon: 'success',
                    title: '¡Video cargado!',
                    text: 'El archivo de video fue subido y vinculado correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            }
        } catch (err) {
            console.error('Error al subir video:', err);
            const errorMessage =
                err.response?.data?.errors?.video?.[0] ||
                err.response?.data?.message ||
                (err.response?.status === 413 ? 'El archivo excede el tamaño máximo permitido por el servidor web.' : null) ||
                (err.code === 'ECONNABORTED' ? 'Tiempo de espera agotado al transferir el archivo.' : null) ||
                err.message ||
                'No se pudo procesar el archivo de video.';

            Swal.fire({
                icon: 'error',
                title: 'Error al subir video',
                text: errorMessage,
            });
        } finally {
            setUploadingVideo(false);
            setUploadProgress(0);
            if (fileInputVideoRef.current) {
                fileInputVideoRef.current.value = '';
            }
        }
    };

    // Subir imagen de portada para el video
    const handleUploadPortadaFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'Imagen muy pesada',
                text: 'La imagen de portada no debe exceder los 10MB.',
            });
            if (fileInputPortadaRef.current) fileInputPortadaRef.current.value = '';
            return;
        }

        setUploadingPortada(true);
        const formData = new FormData();
        formData.append('portada', file);

        try {
            const res = await uploadLegalidadPortadaVideo(formData);
            if (res.success && res.url) {
                setPortadaVideo(res.url);
                Swal.fire({
                    icon: 'success',
                    title: '¡Portada subida!',
                    text: 'La imagen de portada del video ha sido actualizada.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error('Error al subir imagen de portada:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al subir imagen de portada',
                text: error.response?.data?.message || 'No se pudo subir la imagen.',
            });
        } finally {
            setUploadingPortada(false);
            if (fileInputPortadaRef.current) fileInputPortadaRef.current.value = '';
        }
    };

    // Eliminar imagen de portada
    const handleDeletePortada = async () => {
        const confirm = await Swal.fire({
            title: '¿Eliminar imagen de portada?',
            text: 'El video volverá a mostrar su fotograma inicial por defecto.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                await deleteLegalidadPortadaVideo();
                setPortadaVideo('');
                Swal.fire({
                    icon: 'success',
                    title: 'Portada eliminada',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.error('Error al eliminar portada:', error);
                setPortadaVideo('');
            }
        }
    };

    // Conteo de palabras
    const getWordCount = (str) => {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(Boolean).length;
    };

    // Control de texto con límite de palabras (máx. 300)
    const handleTextoChange = (e) => {
        const val = e.target.value;
        const words = val.trim().split(/\s+/).filter(Boolean);
        if (words.length > 300) {
            const limited = words.slice(0, 300).join(' ');
            setTexto(limited);
            return;
        }
        setTexto(val);
    };

    // Control de título con límite de palabras (máx. 30)
    const handleTituloChange = (e) => {
        const val = e.target.value;
        const words = val.trim().split(/\s+/).filter(Boolean);
        if (words.length > 30) {
            const limited = words.slice(0, 30).join(' ');
            setTitulo(limited);
            return;
        }
        setTitulo(val);
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-12 h-12 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-gray-500">Cargando módulo de Legalidad y Vigencia...</p>
            </div>
        );
    }

    const imageURLsList = imagenes.map((img) => getImageUrl(img.ruta_imagen));

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Header section with Title & Action Button (Estilo Testimonios) */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2 text-[#001f6c]">
                        <ShieldCheck size={28} weight="fill" className="text-[#ed6f00]" />
                        <h1 className="text-2xl font-bold tracking-tight">Legalidad y Vigencia</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona la información corporativa, licencias, certificados, video y el enlace exclusivo de consulta.
                    </p>
                </div>

                <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#ed6f00] text-white rounded-xl font-bold text-sm hover:bg-[#ed6f00]/90 shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Check size={18} weight="bold" /> Guardar Cambios
                        </>
                    )}
                </button>
            </div>

            {/* SECCIÓN PRINCIPAL: ENLACE COMPARTIBLE */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#ed6f00]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/10 text-orange-500 rounded-full text-xs font-bold uppercase tracking-wider border border-white/15">
                                Acceso Restringido mediante Token
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRegenerateToken}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-300/80 hover:bg-gray-300/90 text-blue-800 transition-colors"
                                title="Generar un nuevo token único"
                            >
                                <ArrowClockwise size={15} /> Regenerar Token
                            </button>

                            <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ed6f00] hover:bg-[#ed6f00]/90 text-white transition-colors"
                            >
                                <ArrowSquareOut size={15} /> Vista Previa
                            </a>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-400/90 leading-relaxed max-w-2xl">
                    Comparte este enlace exclusivo con clientes o entidades que requieran validar licencias y vigencia:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                        <div className="flex-1 bg-gray-300/80 border border-white/20 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-blue-600 select-all truncate flex items-center">
                            {publicUrl || 'Generando enlace...'}
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="px-5 py-3 bg-white text-[#001f6c] font-bold text-xs sm:text-sm rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 shadow-md"
                        >
                            {copied ? (
                                <>
                                    <Check size={18} weight="bold" className="text-emerald-600" />
                                    ¡Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={18} weight="bold" className="text-[#ed6f00]" />
                                    Copiar Enlace
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 1: TEXTO INFORMATIVO Y LEGAL */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 text-[#001f6c] border-b border-gray-100 pb-4">
                    <FileText size={22} weight="bold" className="text-[#ed6f00]" />
                    <h2 className="text-lg font-bold">1. Texto Informativo</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                Título Principal de la Sección
                            </label>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                                getWordCount(titulo) >= 30 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {getWordCount(titulo)} / 30 palabras
                            </span>
                        </div>
                        <input
                            type="text"
                            value={titulo}
                            onChange={handleTituloChange}
                            placeholder="Ej: ¡SOMOS PLAN DE VIAJE, MÁS QUE VIAJAR!"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/30 focus:border-[#ed6f00] text-sm text-gray-900 font-semibold transition"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                Descripción / Contenido Informativo
                            </label>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                getWordCount(texto) > 300
                                    ? 'bg-rose-100 text-rose-700'
                                    : getWordCount(texto) >= 30
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                                {getWordCount(texto)} / 300 palabras
                            </span>
                        </div>
                        <textarea
                            rows={6}
                            value={texto}
                            onChange={handleTextoChange}
                            placeholder="Escribe aquí los párrafos explicativos sobre la trayectoria, acreditaciones y solvencia de la agencia (mínimo sugerido 30 palabras, máximo 300 palabras)..."
                            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/30 focus:border-[#ed6f00] text-sm text-gray-800 leading-relaxed transition resize-none h-44 overflow-y-auto"
                        />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mt-1.5 text-[11px] text-gray-400">
                            <span>Tip: Puedes separar con dobles saltos de línea para estructurar diferentes párrafos con fluidez.</span>
                            <span className="font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                Límite permitido: 30 a 300 palabras
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: VIDEO REPRESENTATIVO */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 text-[#001f6c] border-b border-gray-100 pb-4">
                    <VideoCamera size={22} weight="bold" className="text-[#ed6f00]" />
                    <h2 className="text-lg font-bold">2. Video Representativo</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                Enlace de Video (URL)
                            </label>
                            <input
                                type="url"
                                value={urlVideo}
                                onChange={(e) => setUrlVideo(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=... o https://...video.mp4"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/30 focus:border-[#ed6f00] text-xs sm:text-sm text-gray-900 transition"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                Compatible con YouTube, Vimeo o enlaces directos a archivos de video (.mp4).
                            </p>
                        </div>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-bold">subir archivo</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div>
                            <input
                                ref={fileInputVideoRef}
                                type="file"
                                accept="video/*"
                                onChange={handleUploadVideoFile}
                                className="hidden"
                            />

                            <p className="text-[11px] text-gray-400 mt-1">
                                Compatible con (.mp4, .webm).
                            </p>

                            <button
                                type="button"
                                onClick={() => fileInputVideoRef.current?.click()}
                                disabled={uploadingVideo}
                                className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#ed6f00] bg-gray-50/50 hover:bg-orange-50/30 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#ed6f00] transition group disabled:opacity-50"
                            >
                                {uploadingVideo ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin" />
                                        Subiendo video {uploadProgress > 0 ? `(${uploadProgress}%)` : 'al servidor'}...
                                    </>
                                ) : (
                                    <>
                                        <UploadSimple size={18} className="group-hover:scale-110 transition-transform" />
                                        Seleccionar video desde la computadora (Hasta 250MB)
                                    </>
                                )}
                            </button>
                        </div>

                        {urlVideo && (
                            <button
                                type="button"
                                onClick={() => setUrlVideo('')}
                                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold pt-1"
                            >
                                <Trash size={14} /> Quitar video configurado
                            </button>
                        )}

                        {/* PORTADA / CARÁTULA DEL VIDEO */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Imagen de Portada
                                </label>
                                {portadaVideo && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        Portada activa
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={portadaVideo}
                                    onChange={(e) => setPortadaVideo(e.target.value)}
                                    placeholder="Ruta o URL de portada (ej. /uploads/... o https://...)"
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/30 focus:border-[#ed6f00] text-xs text-gray-900 transition"
                                />

                                <input
                                    ref={fileInputPortadaRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadPortadaFile}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputPortadaRef.current?.click()}
                                    disabled={uploadingPortada}
                                    className="px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#ed6f00] bg-gray-50 hover:bg-orange-50/50 text-[#001f6c] hover:text-[#ed6f00] text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap disabled:opacity-50"
                                    title="Subir archivo de imagen para la portada"
                                >
                                    {uploadingPortada ? (
                                        <div className="w-3.5 h-3.5 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <UploadSimple size={15} weight="bold" />
                                    )}
                                    <span>Subir Portada</span>
                                </button>
                            </div>

                            {/* Mini preview de la portada */}
                            {portadaVideo && (
                                <div className="flex items-center justify-between p-2.5 bg-blue-50/40 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img
                                            src={getImageUrl(portadaVideo)}
                                            alt="Portada del video"
                                            className="w-14 h-10 rounded-lg object-cover border border-blue-200 shadow-xs flex-shrink-0"
                                        />
                                        <div className="truncate text-left">
                                            <p className="text-xs font-bold text-[#001f6c] truncate">Portada asignada</p>
                                            <p className="text-[10px] text-gray-400 truncate max-w-[220px]">{portadaVideo}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDeletePortada}
                                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold flex-shrink-0"
                                    >
                                        <Trash size={14} /> Quitar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="flex flex-col justify-center">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Vista Previa del Reproductor
                        </label>

                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-inner flex items-center justify-center relative">
                            {urlVideo ? (
                                urlVideo.includes('youtube.com') || urlVideo.includes('youtu.be') ? (
                                    <iframe
                                        src={
                                            urlVideo.includes('watch?v=')
                                                ? `https://www.youtube.com/embed/${urlVideo.split('watch?v=')[1]?.split('&')[0]}`
                                                : urlVideo.includes('youtu.be/')
                                                ? `https://www.youtube.com/embed/${urlVideo.split('youtu.be/')[1]}`
                                                : urlVideo
                                        }
                                        title="Video Preview"
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        src={getImageUrl(urlVideo)}
                                        poster={portadaVideo ? getImageUrl(portadaVideo) : undefined}
                                        controls
                                        onEnded={(e) => {
                                            e.target.currentTime = 0;
                                        }}
                                        className="w-full h-full object-contain"
                                    />
                                )
                            ) : (
                                <div className="text-center p-6 text-gray-400 space-y-2">
                                    <VideoCamera size={36} className="mx-auto opacity-50 text-gray-300" />
                                    <p className="text-xs">No hay video configurado aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: SUBIDA DE IMÁGENES Y REORDENAMIENTO DE CARRUSEL */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2.5 text-[#001f6c]">
                        <ImageIcon size={22} weight="bold" className="text-[#ed6f00]" />
                        <div>
                            <h2 className="text-lg font-bold">3. Carrusel de Documentación Legal</h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputImagesRef.current?.click()}
                        disabled={uploadingImages}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#001f6c] text-white rounded-xl font-bold text-xs hover:bg-[#001f6c]/90 transition shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {uploadingImages ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Plus size={16} weight="bold" /> Subir Imágenes
                            </>
                        )}
                    </button>
                    <input
                        ref={fileInputImagesRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSelectImages}
                        className="hidden"
                    />
                </div>

                {imagenes.length === 0 ? (
                    <div
                        onClick={() => fileInputImagesRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#ed6f00] rounded-3xl p-10 text-center bg-gray-50/50 hover:bg-orange-50/20 transition group"
                    >
                        <ImageIcon size={48} className="mx-auto text-gray-300 group-hover:text-[#ed6f00] transition-colors mb-3" />
                        <h4 className="text-sm font-bold text-gray-700">Aún no hay imágenes añadidas</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                            Haz clic aquí para seleccionar una o varias imágenes.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
                            <span>Usa las flechas para modificar el orden de visualización</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {imagenes.map((item, index) => {
                                const fullUrl = getImageUrl(item.ruta_imagen);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex flex-col justify-between group hover:border-[#001f6c]/30 hover:shadow-md transition-all relative"
                                    >
                                        {/* Badge de Orden */}
                                        <div className="absolute top-4 left-4 z-10 px-2 py-0.5 bg-[#001f6c] text-white text-[11px] font-extrabold rounded-md shadow-sm">
                                            #{index + 1}
                                        </div>

                                        {/* Imagen Thumbnail */}
                                        <div
                                            className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-200 cursor-pointer relative"
                                            onClick={() => setLightbox({ open: true, start: index })}
                                        >
                                            <img
                                                src={fullUrl}
                                                alt={`Documento ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <Eye size={22} weight="bold" />
                                            </div>
                                        </div>

                                        {/* Barra de Controles de Posición */}
                                        <div className="mt-3 pt-2.5 border-t border-gray-200/80 flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveImage(index, -1)}
                                                    disabled={index === 0}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-[#001f6c] hover:text-white hover:border-[#001f6c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition"
                                                    title="Mover hacia la izquierda"
                                                >
                                                    <ArrowLeft size={14} weight="bold" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveImage(index, 1)}
                                                    disabled={index === imagenes.length - 1}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-[#001f6c] hover:text-white hover:border-[#001f6c] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-700 transition"
                                                    title="Mover hacia la derecha"
                                                >
                                                    <ArrowRight size={14} weight="bold" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(item.id)}
                                                className="p-1.5 rounded-lg bg-white border border-gray-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                                                title="Eliminar imagen"
                                            >
                                                <Trash size={14} weight="bold" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Preview */}
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

export default LegalidadVigencia;
