import { useState } from 'react';
import { getFeatureIcon } from '../../utils/featureIcons';
import { 
    MapPinIcon, 
    FileTextIcon, 
    UserIcon, 
    AirplaneTiltIcon, 
    CaretDownIcon, 
    CheckIcon 
} from '@phosphor-icons/react';

/**
 * FlightInfo — Información específica de vuelos.
 *
 * @param {string}   destination      — Ciudad/País de destino
 * @param {string}   requirementsShort — Resumen de requisitos (ej: "Visa Requerida")
 * @param {string}   tripType         — "Ida y Vuelta" o "Solo Ida"
 * @param {string}   description      — Texto descriptivo largo
 * @param {Array}    requirements     — Listado de strings con requisitos detallados
 * @param {Array}    amenities        — Servicios (Equipaje, WiFi, etc.)
 */
const FlightInfo = ({ 
    destination, 
    country, 
    requirementsShort, 
    tripType, // Reemplaza guestType/boardType
    description, 
    requirements = [], 
    amenities = [] 
}) => {
    const [expanded, setExpanded] = useState(false);

    const highlights = [
        {
            icon: <MapPinIcon className="w-6 h-6" />,
            label: 'Destino',
            value: destination,
        },
        {
            icon: <FileTextIcon className="w-6 h-6" />,
            label: 'Requisitos',
            value: requirementsShort,
        },
        {
            icon: <UserIcon className="w-6 h-6" />,
            label: 'Pasajero',
            value: 'Por Persona', // Texto fijo según tu instrucción
        },
        {
            icon: <AirplaneTiltIcon className="w-6 h-6" />,
            label: 'Trayecto',
            value: tripType || 'Consultar', // Muestra si es Ida y Vuelta o Solo Ida
        },
    ];

    const SHORT_LENGTH = 280;
    const isLong = description && description.length > SHORT_LENGTH;
    const displayText = expanded || !isLong ? description : description.slice(0, SHORT_LENGTH) + '…';

    return (
        <div className="space-y-10">
            {/* ── Highlights card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#ed6f00]">
                                {h.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#001f6c] leading-tight">{h.value}</p>
                                <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5 font-bold">{h.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Descripción ─────────────────────────────────────── */}
            {description && (
                <div>
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Detalles del Itinerario</h2>
                    <p className="text-[15px] leading-relaxed text-gray-600 font-medium">{displayText}</p>
                    {isLong && (
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-4 text-[15px] font-bold text-[#ed6f00] hover:text-[#ed6f00]/90 transition-colors flex items-center gap-1.5"
                        >
                            {expanded ? 'Leer menos' : 'Leer más'}
                            <CaretDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}  />
                        </button>
                    )}
                </div>
            )}

            {/* ── Requisitos de Viaje ───────────────────────────────── */}
            {requirements && requirements.length > 0 && (
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-dashed border-gray-200">
                    <h2 className="text-xl font-bold text-[#001f6c] mb-4 flex items-center gap-2">
                        <FileTextIcon className="text-[#ed6f00]" />
                        Documentación para {country || destination}
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        {requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="shrink-0 mt-1 w-5 h-5 rounded-full bg-white text-[#ed6f00] shadow-sm flex items-center justify-center">
                                    <CheckIcon className="w-3" weight="bold" />
                                </span>
                                <span className="text-[14px] text-gray-700 font-medium">{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Servicios Incluidos (Amenities) ──────────────────── */}
            {amenities.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Servicios Incluidos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {amenities.map((a, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 h-14 text-sm font-bold text-[#001f6c]/80 shadow-sm transition-hover hover:border-[#ed6f00]/30"
                            >
                                <span className="shrink-0 text-[#ed6f00]">
                                    {typeof a.icon === 'string' ? getFeatureIcon(a.icon) : a.icon}
                                </span>
                                {a.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightInfo;