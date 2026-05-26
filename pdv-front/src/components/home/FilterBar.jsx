import React, { useState, useRef, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { MagnifyingGlassIcon, CalendarIcon, UsersIcon, PlusIcon, MinusIcon, CaretDownIcon, CurrencyDollarIcon } from '@phosphor-icons/react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const Counter = ({ label, value, onChange, min = 0 }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-semibold text-[#001f6c]">{label}</span>
        <div className="flex items-center gap-3">
            <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#ed6f00] hover:text-[#ed6f00] transition-colors"><MinusIcon weight="bold" className="w-3 h-3" /></button>
            <span className="text-sm font-bold text-[#001f6c] w-4 text-center">{value}</span>
            <button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#ed6f00] hover:text-[#ed6f00] transition-colors"><PlusIcon weight="bold" className="w-3 h-3" /></button>
        </div>
    </div>
);

const GuestsDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { adults = 2, children = 0, rooms = 1 } = value || {};

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleUpdate = (k, v) => onChange({ ...value, [k]: v });

    return (
        <div ref={ref} className="relative flex flex-col gap-1.5 w-full">
            <span className="text-xs font-bold uppercase tracking-wide text-[#001f6c]/70 pl-1">Personas</span>
            <button 
                type="button" 
                onClick={() => setOpen(!open)} 
                className={`
                    flex items-center justify-between h-11 rounded-full border-2 bg-white px-4 
                    text-sm font-semibold text-[#001f6c] shadow-sm cursor-pointer transition-all duration-200
                    ${open ? 'border-[#ed6f00] ring-2 ring-[#ed6f00]/20' : 'border-[#001f6c]/20 hover:border-[#ed6f00]/60'}
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    <UsersIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{adults} ad · {children} niñ · {rooms} hab</span>
                </div>
                <CaretDownIcon className={`shrink-0 w-4 h-4 text-[#ed6f00] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-4 w-64 bg-white border-2 border-[#ed6f00]/30 rounded-2xl shadow-xl shadow-[#001f6c]/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <Counter label="Adultos" value={adults} onChange={(v) => handleUpdate('adults', v)} min={1} />
                    <Counter label="Niños" value={children} onChange={(v) => handleUpdate('children', v)} />
                    <Counter label="Habitaciones" value={rooms} onChange={(v) => handleUpdate('rooms', v)} min={1} />
                </div>
            )}
        </div>
    );
};

const StyledDateRange = ({ label, startDate, endDate, onStartChange, onEndChange }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-bold uppercase tracking-wide text-[#001f6c]/70 pl-1">{label}</span>
        <div className="flex items-center gap-2 h-11 rounded-full border-2 border-[#001f6c]/20 bg-white px-4 shadow-sm transition-all focus-within:border-[#ed6f00] focus-within:ring-2 focus-within:ring-[#ed6f00]/20 hover:border-[#ed6f00]/60 relative">
            <CalendarIcon className="w-5 h-5 text-[#ed6f00] shrink-0" />
            <div className="relative flex-1">
                <input type="date" value={startDate} onChange={onStartChange} className="w-full bg-transparent text-sm font-semibold text-[#001f6c] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
            </div>
            <span className="text-gray-400 font-bold">—</span>
            <div className="relative flex-1">
                <input type="date" value={endDate} onChange={onEndChange} className="w-full bg-transparent text-sm font-semibold text-[#001f6c] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
            </div>
        </div>
    </div>
);

const PriceRangeSelector = ({ value, onChange, minBound = 0, maxBound = 1000 }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const currentMin = value?.min ?? minBound;
    const currentMax = value?.max ?? maxBound;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMinChange = (e) => {
        const val = Number(e.target.value);
        onChange({ min: val, max: currentMax });
    };

    const handleMaxChange = (e) => {
        const val = Number(e.target.value);
        onChange({ min: currentMin, max: val });
    };

    return (
        <div ref={ref} className="relative flex flex-col gap-1.5 w-full">
            <span className="text-xs font-bold uppercase tracking-wide text-[#001f6c]/70 pl-1">Rango de precio</span>
            <button 
                type="button" 
                onClick={() => setOpen(!open)} 
                className={`
                    flex items-center justify-between h-11 rounded-full border-2 bg-white px-4 
                    text-sm font-semibold text-[#001f6c] shadow-sm cursor-pointer transition-all duration-200
                    ${open ? 'border-[#ed6f00] ring-2 ring-[#ed6f00]/20' : 'border-[#001f6c]/20 hover:border-[#ed6f00]/60'}
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    <CurrencyDollarIcon className="w-5 h-5 text-[#ed6f00] shrink-0" />
                    <span>${currentMin} - ${currentMax}</span>
                </div>
                <CaretDownIcon className={`shrink-0 w-4 h-4 text-[#ed6f00] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-2 p-5 w-72 bg-white border-2 border-[#ed6f00]/30 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex flex-col gap-4">
                        <p className="text-xs text-gray-500 font-medium">Precios disponibles: ${minBound} a ${maxBound}</p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col w-full">
                                <label className="text-xs text-[#001f6c] font-bold mb-1">Mínimo ($)</label>
                                <input 
                                    type="number" 
                                    value={currentMin} 
                                    onChange={handleMinChange}
                                    min={minBound}
                                    max={currentMax}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#ed6f00] focus:ring-1 focus:ring-[#ed6f00] outline-none text-sm font-semibold text-[#001f6c]"
                                />
                            </div>
                            <span className="text-gray-300 font-black mt-5">-</span>
                            <div className="flex flex-col w-full">
                                <label className="text-xs text-[#001f6c] font-bold mb-1">Máximo ($)</label>
                                <input 
                                    type="number" 
                                    value={currentMax} 
                                    onChange={handleMaxChange}
                                    min={currentMin}
                                    max={maxBound}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-[#ed6f00] focus:ring-1 focus:ring-[#ed6f00] outline-none text-sm font-semibold text-[#001f6c]"
                                />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setOpen(false)} className="px-5 py-2 bg-[#ed6f00] text-white text-xs font-bold rounded-lg hover:bg-[#d66400] transition-colors">
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── FilterBar ─────────────────────────────────────────────────────────────────
const FilterBar = ({ onSearch, minBound = 0, maxBound = 1000 }) => {
    const [ubicacion, setUbicacion] = useState('Margarita');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
    const [priceRange, setPriceRange] = useState(null);

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch({
                ubicacion,
                startDate,
                endDate,
                guests,
                // priceRange will default to the bounding limits if user didn't change it, 
                // but if it's null we can just omit it or pass the full range.
                // We pass what priceRange is currently set to, or the bounds.
                priceRange: priceRange ? { min: priceRange.min, max: priceRange.max } : { min: minBound, max: maxBound }
            });
        }
    };

    return (
        <section className="relative z-50 px-4 sm:px-6 py-4">
            <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-md border border-[#001f6c]/10">
                
                {/* Filters row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(150px,1fr)_minmax(280px,1.5fr)_minmax(200px,1fr)_minmax(200px,1fr)_auto] lg:items-end">

                    <CustomSelect
                        label="Ubicación"
                        options={['Margarita', 'Los Roques', 'Morrocoy', 'Mérida', 'Canaima']}
                        value={ubicacion}
                        onChange={setUbicacion}
                    />

                    <StyledDateRange 
                        label="Fecha Estancia" 
                        startDate={startDate} 
                        endDate={endDate} 
                        onStartChange={(e) => setStartDate(e.target.value)} 
                        onEndChange={(e) => setEndDate(e.target.value)} 
                    />

                    <GuestsDropdown value={guests} onChange={setGuests} />
                    
                    <PriceRangeSelector 
                        value={priceRange} 
                        onChange={setPriceRange} 
                        minBound={Math.floor(minBound)} 
                        maxBound={Math.ceil(maxBound)} 
                    />

                    {/* Search button */}
                    <div className="flex justify-center md:col-span-2 lg:col-span-1 mt-2 lg:mt-0">
                        <button
                            type="button"
                            onClick={handleSearchClick}
                            aria-label="Buscar"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ed6f00] text-white shadow-md transition-all duration-200 hover:bg-[#d96200] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed6f00] focus-visible:ring-offset-2"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FilterBar;
