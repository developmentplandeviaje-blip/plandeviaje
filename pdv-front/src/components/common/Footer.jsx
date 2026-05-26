import { Link } from 'react-router-dom';
import footerBg from '../../assets/footer.png';
import logox from '../../assets/logox.png';
import { useSettings } from '../../context/SettingsContext';
import { MapPinIcon, PhoneCallIcon, EnvelopeIcon, InstagramLogoIcon, FacebookLogoIcon, WhatsappLogoIcon } from '@phosphor-icons/react';

/**
 * Footer del sitio público.
 * Muestra información de la empresa, redes sociales y datos de contacto.
 * Los datos se obtienen dinámicamente desde la configuración del sistema.
 */

const Footer = () => {
    const { settings } = useSettings();


    const formatInstagram = (url) => {
        if (!url) return '@PLANDEVIAJEMGTA';
        try {
            const path = new URL(url).pathname.replace(/\//g, '');
            return path ? `@${path.toUpperCase()}` : '@PLANDEVIAJEMGTA';
        } catch { return '@PLANDEVIAJEMGTA'; }
    };

    const formatFacebook = (url) => {
        if (!url) return 'plandeviaje.com.ve';
        try {
            const urlObj = new URL(url);
            if (urlObj.searchParams.has('id')) return 'plandeviaje.com.ve';
            const path = urlObj.pathname.replace(/\//g, '');
            return path || 'plandeviaje.com.ve';
        } catch { return 'plandeviaje.com.ve'; }
    };

    const formatPhone = (p, fallback) => p ? (p.startsWith('+') ? p : `+${p}`) : fallback;

    return (
        <footer className="relative overflow-hidden content-center text-white">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${footerBg})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[#001a6b]/85" aria-hidden="true" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
                <div className="grid gap-12 md:gap-8 md:grid-cols-3 items-center">
                    {/* Columna izquierda: descripción de la empresa */}
                    <div className="text-sm leading-relaxed text-white/90 text-center md:text-left">
                        <p>
                            Somos más que viajes, planificamos experiencias únicas para cada uno
                            de nuestros viajeros.
                        </p>
                        <p className="mt-4">
                            Son 9 años impulsando los principales lugares turísticos de Venezuela
                            brindando el mejor servicio a través de la asesoría excepcional de
                            nuestro equipo.
                        </p>
                    </div>

                    {/* Columna central: logo y CTA */}
                    <div className="flex flex-col items-center text-center">
                        <img src={logox} alt="Plan de Viaje" className="h-28 w-auto drop-shadow-lg object-contain" />
                        
                        <p className="mt-4 text-sm font-bold italic tracking-wide text-white">
                            ¡Planifica tu próximo viaje desde donde estés!
                        </p>
                        
                        <Link
                            to="/contacto"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ed6f00] px-7 py-2.5 text-sm font-bold text-white shadow-xl transition-transform duration-200 hover:scale-[1.05]"
                        >
                            <WhatsappLogoIcon className="w-5 h-5" />
                            Contáctanos
                        </Link>
                    </div>

                    {/* Columna derecha: datos de contacto */}
                    <div className="flex flex-col md:items-center">
                        <ul className="flex flex-col gap-3.5 text-sm font-medium text-white/90 w-fit">
                            <li className="flex items-start gap-3">
                                <MapPinIcon className="h-6 w-6 text-[#ed6f00] mt-0.5 shrink-0" />
                                <a 
                                    href={`https://maps.google.com/?q=${encodeURIComponent(settings.contact_address || 'CC GALERÍAS FENTE, PISO1. LOCAL N° 31 ISLA DE MARGARITA - VENEZUELA')}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    className="max-w-[200px] hover:text-[#ed6f00] transition-colors leading-snug line-clamp-2 uppercase"
                                    title={settings.contact_address || 'CC GALERÍAS FENTE, PISO1. LOCAL N° 31 ISLA DE MARGARITA - VENEZUELA'}
                                >
                                    {settings.contact_address ? settings.contact_address.toUpperCase() : 'CC GALERÍAS FENTE, PISO1. LOCAL N° 31 ISLA DE MARGARITA - VENEZUELA'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <PhoneCallIcon className="h-6 w-6 text-[#ed6f00] shrink-0" />
                                <a href={`tel:${(settings.contact_phone || '582952644299').replace(/[^\d+]/g, '')}`} className="hover:text-[#ed6f00] transition-colors">
                                    {formatPhone(settings.contact_phone, '+58 295 2644299')}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <WhatsappLogoIcon className="h-6 w-6 text-[#ed6f00] shrink-0" />
                                <a href={`https://wa.me/${(settings.contact_whatsapp || '584120933867').replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#ed6f00] transition-colors">
                                    {formatPhone(settings.contact_whatsapp, '+58 412 0933867')}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <EnvelopeIcon className="h-6 w-6 text-[#ed6f00] shrink-0" />
                                <a href={`mailto:${settings.contact_email || 'RESERVASPLANDEVIAJE@GMAIL.COM'}`} className="hover:text-[#ed6f00] transition-colors uppercase">
                                    {settings.contact_email ? settings.contact_email.toUpperCase() : 'RESERVASPLANDEVIAJE@GMAIL.COM'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <InstagramLogoIcon className="h-6 w-6 text-[#ed6f00] shrink-0" />
                                <a href={settings.social_instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[#ed6f00] transition-colors uppercase">
                                    {formatInstagram(settings.social_instagram)}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FacebookLogoIcon className="h-6 w-6 text-[#ed6f00] shrink-0" />
                                <a href={settings.social_facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-[#ed6f00] transition-colors">
                                    {formatFacebook(settings.social_facebook)}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
