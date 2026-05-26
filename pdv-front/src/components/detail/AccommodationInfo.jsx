import React, { useState } from 'react';
import { getFeatureIcon } from '../../utils/featureIcons';
import { MapPinIcon, StarIcon, ForkKnifeIcon, CaretDownIcon } from '@phosphor-icons/react';

/**
 * AccommodationInfo — matches PackageInfo layout patterns exactly.
 *
 * @param {number} stars       — 1–5
 * @param {string} destination — location text
 * @param {string} boardType   — e.g. "Todo Incluido"
 * @param {string} description — long description text
 * @param {Array}  amenities   — [{ icon: 'wifi', label: 'WiFi Libre' }]
 */
const AccommodationInfo = ({ stars, destination, boardType, description, amenities = [] }) => {
    const [expanded, setExpanded] = useState(false);

    const highlights = [
        {
            icon: <MapPinIcon className="w-6 h-6" />,
            label: 'Destino',
            value: destination,
        },
        {
            icon: <StarIcon className="w-6 h-6" weight="fill" />,
            label: 'Categoría',
            value: `${stars} Estrellas`,
        },
        {
            icon: <ForkKnifeIcon className="w-6 h-6" />,
            label: 'Régimen',
            value: boardType,
        },
    ];

    const SHORT_LENGTH = 280;
    const isLong = description && description.length > SHORT_LENGTH;
    const displayText = expanded || !isLong ? description : description.slice(0, SHORT_LENGTH) + '…';

    return (
        <div className="space-y-10">
            {/* ── Highlights card ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-1">
                    {highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-4 p-2">
                            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#ed6f00]">
                                {h.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#001f6c]">{h.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{h.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Description ─────────────────────────────────────── */}
            {description && (
                <div>
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Acerca del Hotel</h2>
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

            {/* ── Amenities ───────────────────────────────────────── */}
            {amenities.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Servicios y Comodidades</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {amenities.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 h-14 text-sm font-medium text-[#001f6c]/80"
                            >
                                <span className="shrink-0 text-[#ed6f00]">{getFeatureIcon(item.icon)}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccommodationInfo;
