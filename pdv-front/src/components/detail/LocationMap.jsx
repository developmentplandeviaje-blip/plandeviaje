import { MapPinIcon } from '@phosphor-icons/react';

/**
 * LocationMap — Google Maps embed with an "Explorar Mapa" overlay button.
 *
 * @param {string} query      — place name or address for the embed search
 * @param {string} title      — section heading (default: "Ubicación")
 */
const LocationMap = ({ query = '', title = 'Ubicación' }) => {
    const encodedQuery = encodeURIComponent(query);
    const embedUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    return (
        <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 mt-10 pb-6">
            <h2 className="text-2xl font-bold text-[#001f6c] mb-4">{title}</h2>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <iframe
                    title="Mapa de ubicación"
                    src={embedUrl}
                    className="w-full h-64 sm:h-80 md:h-96 border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />

                {/* "Explorar Mapa" overlay */}
                <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg text-sm font-semibold text-[#001f6c] hover:bg-white hover:shadow-xl transition-all duration-200"
                >
                    <MapPinIcon className="w-5 h-5 text-[#ed6f00]"  />
                    Explorar Mapa
                </a>
            </div>
        </section>
    );
};

export default LocationMap;
