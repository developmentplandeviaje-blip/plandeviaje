import { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useSettings } from '../context/SettingsContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
import { WhatsappLogo, Phone, EnvelopeSimple, MapPin, PlayCircle } from '@phosphor-icons/react';
import logo from '../assets/logo.png';
import bannerContacto from '../assets/contacto.png'; // Importación de tu foto

/**
 * Página de contacto.
 * Muestra información de la empresa (teléfono, redes, horarios, mapa)
 * y un formulario que envía una consulta general al backend.
 */

const Contacto = () => {
    useDocumentTitle('Contáctanos');
    const { settings, loading } = useSettings();
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);
        try {
            await api.post('/consultas', {
                client_name: formData.client_name,
                client_email: formData.client_email,
                client_phone: formData.client_phone,
                data: formData.message ? { message: formData.message } : null,
            });
            setSubmitStatus('success');
            setFormData({ client_name: '', client_email: '', client_phone: '', message: '' });
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
                <div className="w-12 h-12 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const videoThumbUrl = settings.contact_video_thumbnail ? getImageUrl(settings.contact_video_thumbnail) : null;

    return (
        <div className="min-h-screen bg-[#e1e6f0]">
            {/* HERO SECTION */}
            <div className="relative w-full">
                <img
                    src={bannerContacto}
                    alt="Banner Contacto"
                    className="w-full h-auto block"
                />

                {/* Overlay oscuro y contenido */}
                <div className="absolute inset-0 bg-[#001f6c]/20 flex items-center justify-center p-4">
                    <div className="relative z-10 max-w-4xl mx-auto text-center text-white space-y-4 md:space-y-6">
                        {settings.contact_hero_text ? (
                            <h1 className="text-[10px] sm:text-lg md:text-xl font-medium tracking-wide text-white drop-shadow-md max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
                                {settings.contact_hero_text}
                            </h1>
                        ) : (
                            <h1 className="text-[10px] sm:text-lg md:text-xl font-medium tracking-wide text-white drop-shadow-md max-w-3xl mx-auto leading-relaxed">
                                Somos mayoristas de viajes y turismo.<br />
                                Para más información ponemos a su disposición<br />
                                nuestros canales de Atención al Cliente.
                            </h1>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT BLOCK */}
            <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">

                {/* HEADLINE */}
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <img src={logo} alt="Plan de Viaje" className="h-16 w-auto object-contain drop-shadow-md" />
                    <h2 className="text-[#001f6c] text-xl md:text-2xl font-black max-w-xl">
                        {settings.contact_location_text || 'Estamos ubicados en la Isla de Margarita - Venezuela'}
                    </h2>
                </div>

                {/* 2 COLUMNS: FORM AND INFO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: FORM */}
                    <div className="bg-white rounded-4xl p-8 md:p-10 shadow-md border border-[#e8ecf5]">
                        <h2 className="text-[#001f6c] text-2xl font-black mb-7 border-b border-[#001f6c]/20 pb-4">Contáctanos</h2>

                        {submitStatus === 'success' && (
                            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center font-medium shadow-sm">
                                ¡Mensaje enviado con éxito! Te contactaremos pronto.
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center font-medium shadow-sm">
                                Hubo un problema al enviar el mensaje. Inténtalo más tarde o contáctanos por WhatsApp.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[#001f6c] text-base font-bold mb-2">Nombre y Apellido</label>
                                <input
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#e6ebf5] border border-gray-300/60 focus:bg-white focus:border-[#001f6c] focus:ring-1 focus:ring-[#001f6c] outline-none rounded-xl p-3 px-4 transition-all font-semibold text-[#001f6c]"
                                />
                            </div>
                            <div>
                                <label className="block text-[#001f6c] text-base font-bold mb-2">Correo Electrónico</label>
                                <input
                                    name="client_email"
                                    type="email"
                                    value={formData.client_email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#e6ebf5] border border-gray-300/60 focus:bg-white focus:border-[#001f6c] focus:ring-1 focus:ring-[#001f6c] outline-none rounded-xl p-3 px-4 transition-all font-semibold text-[#001f6c]"
                                />
                            </div>
                            <div>
                                <label className="block text-[#001f6c] text-base font-bold mb-2">Número de Teléfono</label>
                                <input
                                    name="client_phone"
                                    value={formData.client_phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#e6ebf5] border border-gray-300/60 focus:bg-white focus:border-[#001f6c] focus:ring-1 focus:ring-[#001f6c] outline-none rounded-xl p-3 px-4 transition-all font-semibold text-[#001f6c]"
                                />
                            </div>
                            <div>
                                <label className="block text-[#001f6c] text-base font-bold mb-2">Tu Consulta</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full bg-[#e6ebf5] border border-gray-300/60 focus:bg-white focus:border-[#001f6c] focus:ring-1 focus:ring-[#001f6c] outline-none rounded-xl p-3 px-4 transition-all font-semibold text-[#001f6c] resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-center pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#ed6f00] hover:bg-[#d66400] text-white px-10 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                                >
                                    <WhatsappLogo weight="regular" className="w-6 h-6" />
                                    {submitting ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: INFO & HOURS */}
                    <div className="space-y-8">
                        {/* Info Card */}
                        <div className="bg-white rounded-4xl p-8 md:p-10 shadow-md">
                            <h2 className="text-[#001f6c] text-2xl font-black mb-6 border-b border-[#001f6c]/20 pb-4">Información de Contacto</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                {/* WhatsApp */}
                                <div className="flex items-center gap-4">
                                    <WhatsappLogo weight="regular" className="w-10 h-10 text-[#ed6f00]" />
                                    <div className="flex flex-col">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">WhatsApp</span>
                                        <a href={`https://wa.me/${(settings.contact_whatsapp || '584120933867').replace(/[^\d]/g, '')}`} className="text-[#001f6c] font-semibold text-sm hover:text-[#ed6f00] transition-colors mt-0.5" target="_blank" rel="noopener noreferrer">
                                            +{settings.contact_whatsapp || '58 412 0933867'}
                                        </a>
                                    </div>
                                </div>
                                {/* Instagram */}
                                <div className="flex items-center gap-4">
                                    <svg className="w-10 h-10 text-[#ed6f00]" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">Instagram</span>
                                        <a href={settings.social_instagram || 'https://instagram.com/plandeviajemgta'} className="text-[#001f6c] font-semibold text-sm truncate hover:text-[#ed6f00] transition-colors mt-0.5" target="_blank" rel="noopener noreferrer">
                                            {settings.social_instagram ? settings.social_instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@').replace(/\/$/, '') : '@plandeviajemgta'}
                                        </a>
                                    </div>
                                </div>
                                {/* Teléfono */}
                                <div className="flex items-center gap-4">
                                    <Phone weight="regular" className="w-10 h-10 text-[#ed6f00]" />
                                    <div className="flex flex-col">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">Teléfono</span>
                                        <a href={`tel:${(settings.contact_phone || '582952644299').replace(/[^\d+]/g, '')}`} className="text-[#001f6c] font-semibold text-sm hover:text-[#ed6f00] transition-colors mt-0.5">
                                            +{settings.contact_phone || '58 295 2644299'}
                                        </a>
                                    </div>
                                </div>
                                {/* Facebook */}
                                <div className="flex items-center gap-4">
                                    <svg className="w-10 h-10 text-[#ed6f00]" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">Facebook</span>
                                        <a href={settings.social_facebook || 'https://facebook.com/plandeviaje.com.ve'} className="text-[#001f6c] font-semibold text-sm truncate hover:text-[#ed6f00] transition-colors mt-0.5" target="_blank" rel="noopener noreferrer">
                                            {settings.social_facebook ? (() => {
                                                try {
                                                    const u = new URL(settings.social_facebook);
                                                    if (u.searchParams.has('id')) return 'plandeviaje.com.ve';
                                                    return u.pathname.replace(/\//g, '') || 'plandeviaje.com.ve';
                                                } catch { return 'plandeviaje.com.ve'; }
                                            })() : 'plandeviaje.com.ve'}
                                        </a>
                                    </div>
                                </div>
                                {/* Correo */}
                                <div className="flex items-center gap-4 md:col-span-2 pt-2">
                                    <EnvelopeSimple weight="regular" className="w-10 h-10 text-[#ed6f00] shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">Correo</span>
                                        <a href={`mailto:${settings.contact_email || 'reservasplandeviaje@gmail.com'}`} className="text-[#001f6c] font-semibold text-sm hover:text-[#ed6f00] transition-colors mt-0.5">
                                            {settings.contact_email || 'reservasplandeviaje@gmail.com'}
                                        </a>
                                    </div>
                                </div>
                                {/* Ubicacion */}
                                <div className="flex items-start gap-4 md:col-span-2 pt-2">
                                    <MapPin weight="fill" className="w-10 h-10 text-[#ed6f00] shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[#001f6c] font-black text-base leading-tight">Ubicación</span>
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(settings.contact_address || 'CC Galerías Fente, Piso 1, Local N° 31 Isla de Margarita - Venezuela')}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-[#001f6c] font-semibold text-sm whitespace-pre-line leading-relaxed hover:text-[#ed6f00] transition-colors mt-1"
                                        >
                                            {settings.contact_address || 'CC Galerías Fente, Piso 1, Local N° 31\nIsla de Margarita - Venezuela'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-white rounded-4xl p-8 md:p-10 shadow-md border border-[#e8ecf5]">
                            <h2 className="text-[#001f6c] text-2xl font-black mb-6 border-b border-[#001f6c]/20 pb-4">Horas de Servicio</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[#001f6c] font-black text-base leading-tight">Lunes - Viernes</span>
                                    <span className="text-[#001f6c] font-semibold text-sm mt-1">{settings.contact_hours_weekdays || '7:00AM - 3:30PM'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[#001f6c] font-black text-base leading-tight">Sábados</span>
                                    <span className="text-[#001f6c] font-semibold text-sm mt-1">{settings.contact_hours_saturday || '7:00AM - 3:30PM'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[#001f6c] font-black text-base leading-tight">Domingos</span>
                                    <span className="text-[#001f6c] font-semibold text-sm mt-1">{settings.contact_hours_sunday || '7:00AM - 3:30PM'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM MEDIA GRID: VIDEO AND MAP */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 pb-20">

                    {/* VIDEO BLOCK */}
                    <div className="rounded-3xl overflow-hidden shadow-lg h-[400px] relative group bg-[#001f6c]">
                        {videoThumbUrl ? (
                            <img src={videoThumbUrl} alt="Video Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#001f6c] to-[#00103a] flex flex-col items-center justify-center text-white p-8">
                                <MapPin weight="fill" className="w-16 h-16 text-[#ed6f00] mb-6" />
                                <h3 className="text-3xl font-black text-center leading-tight mb-2">¿YA SABES CÓMO</h3>
                                <h3 className="text-4xl font-black text-center text-[#ed6f00]">UBICARNOS?</h3>
                            </div>
                        )}

                        {/* Play Overlay */}
                        <a
                            href={settings.contact_video_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                        >
                            <PlayCircle weight="fill" className="w-20 h-20 text-white drop-shadow-lg" />
                        </a>
                    </div>

                    {/* MAP BLOCK */}
                    <div className="rounded-3xl overflow-hidden shadow-lg h-[400px] bg-white">
                        {settings.contact_map_frame ? (
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: `<iframe src="${settings.contact_map_frame}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` }} />
                        ) : (
                            /* Mapa de ubicación por defecto (Porlamar, Nueva Esparta) */
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.486221535496!2d-63.844!3d10.958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDU3JzI4LjgiTiA2M8KwNTAnMzguNCJX!5e0!3m2!1ses!2sve!4v1710000000000!5m2!1ses!2sve"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mapa"
                            ></iframe>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contacto;