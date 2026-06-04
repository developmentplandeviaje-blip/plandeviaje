import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon } from '@phosphor-icons/react';
import { List, X } from '@phosphor-icons/react';

const DashboardLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Cerrar sidebar al cambiar de ruta en móvil
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    // Bloquear scroll cuando el sidebar está abierto en móvil
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSidebarOpen]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-[#f4f7fb] font-sans relative">
            {/* Backdrop Overlay (Mobile only) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[#001f6c]/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar with responsive behavior */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main area - DUAL LAYOUT REFACTOR */}
            <div className="flex flex-col min-h-screen w-full lg:pl-64 transition-all duration-300 ease-in-out">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-2 text-[#001f6c]">
                        {/* Mobile: show logo */}
                        <Link to="/" className="lg:hidden flex items-center gap-2">
                            <img src={logo} alt="Plan de Viaje" className="h-7 w-auto object-contain" />
                        </Link>
                        <span className="text-sm font-medium text-[#8898aa] hidden lg:block">
                            Panel de Administración
                        </span>
                    </div>

                    {/* Admin avatar & Toggle button */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#ed6f00]/10 text-[#ed6f00] rounded-full px-4 py-1.5 text-sm font-semibold">
                            <UserCircleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">{user?.name || 'Administrador'}</span>
                            <span className="sm:hidden">{user?.name?.split(' ')[0] || 'Admin'}</span>
                        </div>

                        {/* Toggle Trigger (Visible ONLY on mobile) */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg text-[#001f6c] hover:bg-[#001f6c] hover:text-white transition-all duration-300 active:scale-95 z-50"
                            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                        >
                            {isSidebarOpen ? (
                                <X size={20} weight="bold" />
                            ) : (
                                <List size={20} weight="bold" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
