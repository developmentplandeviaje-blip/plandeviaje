import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { useTour } from '../../context/TourContext';
import { HouseIcon, PackageIcon, AirplaneIcon, BuildingsIcon, ArticleIcon, ChatTeardropTextIcon, UsersIcon, UserCircleIcon, WhatsappLogoIcon, InfoIcon, ImagesIcon, PencilLineIcon, QuestionIcon, SignOutIcon, BookOpenTextIcon, CaretDownIcon } from '@phosphor-icons/react';

const NAV_ITEMS = [
    {
        section: 'Menú',
        items: [
            {
                label: 'Dashboard',
                id: 'nav-dashboard',
                to: '/dashboard',
                allowedRoles: [1, 2, 3],
                icon: <HouseIcon className="w-5 h-5"  />,
            },
            {
                label: 'Usuarios',
                id: 'nav-usuarios',
                to: '/dashboard/usuarios',
                allowedRoles: [1],
                icon: <UserCircleIcon className="w-5 h-5"  />,
            },
        ],
    },
    {
        section: 'Catálogo',
        items: [
            {
                label: 'Paquetes',
                id: 'nav-paquetes',
                to: '/dashboard/paquetes',
                allowedRoles: [1, 2],
                icon: <PackageIcon className="w-5 h-5"  />,
            },
            {
                label: 'Vuelos',
                id: 'nav-vuelos',
                to: '/dashboard/vuelos',
                allowedRoles: [1, 2],
                icon: <AirplaneIcon className="w-5 h-5"  />,
            },
            {
                label: 'Hoteles',
                id: 'nav-hoteles',
                to: '/dashboard/hoteles',
                allowedRoles: [1, 2],
                icon: <BuildingsIcon className="w-5 h-5"  />,
            },
            {
                label: 'Blog',
                id: 'nav-blog',
                to: '/dashboard/blog',
                allowedRoles: [1, 2],
                icon: <ArticleIcon className="w-5 h-5"  />,
            },
        ],
    },
    {
        section: 'Atención',
        items: [
            {
                label: 'Consultas',
                id: 'nav-consultas',
                to: '/dashboard/consultas',
                allowedRoles: [1, 3],
                icon: <ChatTeardropTextIcon className="w-5 h-5"  />,
            },
            {
                label: 'Asesores',
                id: 'nav-asesores',
                to: '/dashboard/asesores',
                allowedRoles: [1, 3],
                icon: <UsersIcon className="w-5 h-5"  />,
            },
            {
                label: 'WhatsApp',
                id: 'nav-whatsapp',
                to: '/dashboard/whatsapp',
                allowedRoles: [1, 3],
                icon: <WhatsappLogoIcon className="w-5 h-5"  />,
            },
        ],
    },
    {
        section: 'Editar Página',
        id: 'nav-edit-pages',
        items: [
            {
                label: 'Información',
                to: '/dashboard/informacion',
                allowedRoles: [1, 2],
                icon: <InfoIcon className="w-5 h-5"  />,
            },
            {
                label: 'Imagenes',
                to: '/dashboard/imagenes',
                allowedRoles: [1, 2],
                icon: <ImagesIcon className="w-5 h-5"  />,
            },
            {
                label: 'Contenido',
                to: '/dashboard/contenido',
                allowedRoles: [1, 2],
                icon: <PencilLineIcon className="w-5 h-5"  />,
            },
        ],
    },
];

const SidebarLink = ({ to, icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#ed6f00] text-white shadow-sm shadow-orange-200'
                : 'text-[#4a5878] hover:bg-[#001f6c]/8 hover:text-[#001f6c]'
            }`
        }
    >
        {icon}
        {label}
    </NavLink>
);

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { startTour } = useTour();
    const [activeSection, setActiveSection] = useState('Menú'); // Set a default open section
    const [ayudaOpen, setAyudaOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleSection = (sectionName) => {
        setActiveSection(activeSection === sectionName ? null : sectionName);
        setAyudaOpen(false); // Close Ayuda if open
    };

    useEffect(() => {
        const handleOpenSidebarSection = (event) => {
            const sectionName = event.detail;
            setActiveSection(sectionName);
            setAyudaOpen(false);
        };

        window.addEventListener('openSidebarSection', handleOpenSidebarSection);
        
        return () => {
            window.removeEventListener('openSidebarSection', handleOpenSidebarSection);
        };
    }, []);

    return (
        <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <img src={logo} alt="Plan de Viaje" className="h-8 w-auto object-contain" />
                <span className="text-xs font-bold text-[#001f6c] uppercase tracking-wider leading-tight">
                    Plan de<br />Viaje
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto custom-scrollbar">
                {NAV_ITEMS.map(({ section, items }) => {
                    const filteredItems = items.filter(item => user && item.allowedRoles.includes(user.role));

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={section} id={NAV_ITEMS.find(n => n.section === section)?.id} className="cursor-pointer">
                            <div 
                                onClick={() => toggleSection(section)}
                                className={`flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg transition-colors ${
                                    activeSection === section 
                                    ? 'bg-[#001f6c]/5 text-[#001f6c]' 
                                    : 'text-[#001f6c]/50 hover:bg-[#001f6c]/5 hover:text-[#001f6c]'
                                }`}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest">
                                    {section}
                                </p>
                                <CaretDownIcon className={`w-3 h-3 transition-transform duration-200 ${activeSection === section ? 'rotate-180' : ''}`} />
                            </div>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${activeSection === section ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <ul className="space-y-0.5 pb-2">
                                        {filteredItems.map((item) => (
                                            <li key={item.to} id={item.id}>
                                                <SidebarLink
                                                    to={item.to}
                                                    icon={item.icon}
                                                    label={item.label}
                                                    end={item.to === '/dashboard'}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 relative">
                <div className="relative">
                    <button
                        onClick={() => {
                            setAyudaOpen(!ayudaOpen);
                            if (!ayudaOpen) setActiveSection(null); // Close other sections when opening Ayuda
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            ayudaOpen ? 'bg-[#001f6c]/8 text-[#001f6c]' : 'text-[#4a5878] hover:bg-[#001f6c]/8 hover:text-[#001f6c]'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <QuestionIcon className="w-5 h-5" />
                            Ayuda
                        </div>
                        <CaretDownIcon className={`w-3 h-3 transition-transform duration-200 ${ayudaOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {ayudaOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-1 flex flex-col bg-white border border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {/* Static Help Center Link */}
                            <NavLink
                                to="/dashboard/ayuda"
                                onClick={() => setAyudaOpen(false)}
                                className={({ isActive }) => `px-4 py-2.5 text-xs text-left font-medium transition-colors border-b border-gray-50 flex items-center gap-2 ${isActive ? 'bg-[#001f6c]/5 text-[#001f6c]' : 'text-gray-700 hover:bg-[#ed6f00] hover:text-white'}`}
                            >
                                <BookOpenTextIcon className="w-4 h-4" />
                                Centro de Ayuda
                            </NavLink>
                            
                            {/* Dynamic Tour Options */}
                            <div className="bg-gray-50 py-1">
                                {user?.role === 1 ? (
                                    <>
                                        <span className="block px-4 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Repetir Tours</span>
                                        <button onClick={() => { startTour(1); setAyudaOpen(false); }} className="w-full px-4 py-1.5 text-xs text-left text-gray-700 hover:text-[#ed6f00] font-medium transition-colors">Tour Administrador</button>
                                        <button onClick={() => { startTour(2); setAyudaOpen(false); }} className="w-full px-4 py-1.5 text-xs text-left text-gray-700 hover:text-[#ed6f00] font-medium transition-colors">Tour Editor</button>
                                        <button onClick={() => { startTour(3); setAyudaOpen(false); }} className="w-full px-4 py-1.5 text-xs text-left text-gray-700 hover:text-[#ed6f00] font-medium transition-colors">Tour Asesor</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { startTour(user?.role); setAyudaOpen(false); }} className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-[#001f6c]/5 hover:text-[#001f6c] font-medium transition-colors">
                                            Repetir Tour Interactivo
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                    <SignOutIcon className="w-5 h-5"  />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
