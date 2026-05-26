import React, { useState, useRef, useEffect } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';

/**
 * CustomSelect — fully-styled dropdown replacing native <select>.
 *
 * @param {string}   label     - Float label above the trigger
 * @param {string[]} options   - Array of option strings
 * @param {string}   value     - Controlled value
 * @param {function} onChange  - (newValue) => void
 * @param {string}   placeholder
 */
const CustomSelect = ({ label, options = [], value, onChange, placeholder = 'Seleccionar…' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = value || options[0] || placeholder;

    return (
        <div ref={ref} className="relative flex flex-col gap-1.5">
            {label && (
                <span className="text-xs font-bold uppercase tracking-wide text-[#001f6c]/70 pl-1">
                    {label}
                </span>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`
                    w-full h-11 flex items-center justify-between
                    rounded-full px-4
                    border-2 bg-white
                    text-sm font-semibold text-[#001f6c]
                    shadow-sm cursor-pointer
                    transition-all duration-200
                    ${open
                        ? 'border-[#ed6f00] ring-2 ring-[#ed6f00]/20'
                        : 'border-[#001f6c]/20 hover:border-[#ed6f00]/60'
                    }
                `}
            >
                <span>{selected}</span>
                {/* Arrow icon — rotates when open */}
                <CaretDownIcon
                    className={`shrink-0 w-4 h-4 text-[#ed6f00] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            {open && (
                <ul className="
                    absolute top-full left-0 right-0 z-50
                    mt-2
                    bg-white
                    border-2 border-[#ed6f00]/30
                    rounded-2xl
                    shadow-xl shadow-[#001f6c]/10
                    overflow-hidden
                ">
                    {options.map((opt) => (
                        <li key={opt}>
                            <button
                                type="button"
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`
                                    w-full text-left px-5 py-2.5
                                    text-sm font-semibold
                                    transition-colors duration-150
                                    ${opt === selected
                                        ? 'bg-[#ed6f00] text-white'
                                        : 'text-[#001f6c] hover:bg-[#ed6f00]/10 hover:text-[#ed6f00]'
                                    }
                                `}
                            >
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
