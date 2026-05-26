import React, { useState } from 'react';
import { getFeatureIcon } from '../../utils/featureIcons';
import { BuildingsIcon, CalendarIcon, UsersIcon, ForkKnifeIcon, CaretDownIcon } from '@phosphor-icons/react';

/**
 * PackageInfo — Package highlights with icons + description + amenities.
 *
 * @param {string}   accommodation — hotel/resort name
 * @param {string}   days          — e.g. "7 Noches"
 * @param {string}   guestType     — e.g. "Individual", "Pareja", "Familia"
 * @param {string}   boardType     — e.g. "Todo Incluido"
 * @param {string}   description   — long description text
 * @param {Array}    amenities     — [{ icon: ReactNode, label: string }]
 */
const PackageInfo = ({ accommodation, days, guestType, boardType, description, amenities = [] }) => {
    const [expanded, setExpanded] = useState(false);

    const highlights = [
        {
            icon: <BuildingsIcon className="w-6 h-6" />,
            label: 'Alojamiento',
            value: accommodation,
        },
        {
            icon: <CalendarIcon className="w-6 h-6" />,
            label: 'Días',
            value: days,
        },
        {
            icon: <UsersIcon className="w-6 h-6" />,
            label: 'Tipo de Huésped',
            value: guestType,
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-1">
                    {highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-4">
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
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Sobre el Paquete</h2>
                    <p className="text-[15px] leading-relaxed text-gray-600 font-medium">{displayText}</p>
                    {isLong && (
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-4 text-[15px] font-bold text-[#ed6f00] hover:text-[#ed6f00]/90 transition-colors flex items-center gap-1.5"
                        >
                            {expanded ? 'Leer menos' : 'Leer mas'}
                            <CaretDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}  />
                        </button>
                    )}
                </div>
            )}

            {/* ── Hotel & Amenities ──────────────────────────────── */}
            {amenities.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-[#001f6c] mb-4">Caracteristicas del Hotel</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {amenities.map((a, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 h-14 text-sm font-medium text-[#001f6c]/80"
                            >
                                <span className="shrink-0 text-[#ed6f00]">{getFeatureIcon(a.icon)}</span>
                                {a.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageInfo;
