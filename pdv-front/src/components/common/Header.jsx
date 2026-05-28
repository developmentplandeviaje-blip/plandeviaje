import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { ListIcon, XIcon, CaretDown } from '@phosphor-icons/react';

const NAV_LINKS_LEFT = [
    { to: '/', label: 'Inicio' },
    { to: '/about', label: 'Nosotros' },
    { to: '/contacto', label: 'Contáctanos' },
];

const NAV_LINKS_RIGHT = [
    { to: '/vuelos', label: 'Vuelos' },
    { to: '/blog', label: 'Blog' },
];

const HOTELES_SUBMENU = [
    { to: '/hoteles/canaima', label: 'Canaima' },
    { to: '/hoteles/coche', label: 'Isla de Coche' },
    { to: '/hoteles/margarita', label: 'Isla de Margarita' },
    { to: '/hoteles/los-roques', label: 'Los Roques' },
    { to: '/hoteles/merida', label: 'Mérida' },
    { to: '/hoteles/morrocoy', label: 'Morrocoy' },
];

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [hotelesOpen, setHotelesOpen] = useState(false);

    const closeAll = () => { setMenuOpen(false); setHotelesOpen(false); };

    return (
        <header className="sticky top-0 left-0 right-0 z-[100] backdrop-blur-lg border-b border-[#001e6b]/10 bg-white/80 shadow-sm text-[#001e6b]">

            {/* ── Main bar ──────────────────────────────────────────────────── */}
            <div className="px-6 sm:px-8 py-2 relative z-[101]">

                {/* Desktop layout: 3-column grid */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                    {/* Left links */}
                    <div className="flex justify-end gap-8 text-[15px] font-bold uppercase tracking-wider pr-8">
                        {NAV_LINKS_LEFT.map(({ to, label }) => (
                            <Link key={to} to={to} className="hover:text-[#ed6f00] transition-colors">
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center">
                        <Link to="/">
                            <img
                                src={logo}
                                alt="Plan de Viaje"
                                className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>

                    {/* Right links */}
                    <div className="flex justify-start gap-8 text-[15px] font-bold uppercase tracking-wider items-center pl-8">
                        {/* Hoteles dropdown */}
                        <div className="group relative cursor-pointer py-4">
                            <span className="flex items-center gap-1 hover:text-[#ed6f00] transition-colors">
                                HOTELES
                                <CaretDown className="w-4 h-4 pointer-events-none group-hover:rotate-180 transition-transform duration-200" />
                            </span>
                            <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                {HOTELES_SUBMENU.map(({ to, label }) => (
                                    <Link key={to} to={to} className="block px-4 py-3 text-sm hover:bg-[#001e6b]/5 hover:text-[#ed6f00] first:rounded-t-xl last:rounded-b-xl transition-colors">
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {NAV_LINKS_RIGHT.map(({ to, label }) => (
                            <Link key={to} to={to} className="hover:text-[#ed6f00] transition-colors">
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile layout */}
                <div className="flex lg:hidden items-center justify-between">
                    <Link to="/" onClick={closeAll}>
                        <img
                            src={logo}
                            alt="Plan de Viaje"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-xl text-[#001e6b] hover:bg-[#001e6b]/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <XIcon className="w-6 h-6" /> : <ListIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu Overlay ─────────────────────────────────────────── */}
            <div
                className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[#001e6b]/10 shadow-xl transition-all duration-300 ease-in-out z-[99] ${
                    menuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto overscroll-contain' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                <nav className="flex flex-col px-6 pb-6 pt-2 gap-2 border-t border-[#001e6b]/10 font-bold tracking-wide uppercase text-sm">
                    {NAV_LINKS_LEFT.map(({ to, label }) => (
                        <Link key={to} to={to} onClick={closeAll} className="px-3 py-2.5 rounded-xl hover:bg-[#001e6b]/5 hover:text-[#ed6f00]">
                            {label}
                        </Link>
                    ))}
                    
                    {/* Expandable Hotels */}
                    <div className="flex flex-col">
                        <button 
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#001e6b]/5 hover:text-[#ed6f00] text-left uppercase"
                            onClick={() => setHotelesOpen(!hotelesOpen)}
                        >
                            HOTELES
                            <CaretDown className={`w-4 h-4 transition-transform duration-200 ${hotelesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-200 flex flex-col pl-4 border-l-2 border-[#ed6f00]/30 ml-4 mt-1 overscroll-contain ${hotelesOpen ? 'max-h-40 overflow-y-auto' : 'max-h-0 overflow-hidden'}`}>
                            {HOTELES_SUBMENU.map(({ to, label }) => (
                                <Link key={to} to={to} onClick={closeAll} className="py-2.5 px-3 text-xs text-gray-500 hover:text-[#ed6f00]">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {NAV_LINKS_RIGHT.map(({ to, label }) => (
                        <Link key={to} to={to} onClick={closeAll} className="px-3 py-2.5 rounded-xl hover:bg-[#001e6b]/5 hover:text-[#ed6f00]">
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;
