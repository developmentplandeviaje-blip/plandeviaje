import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon } from '@phosphor-icons/react';

const DashboardLayout = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#f4f7fb] font-sans">
            <Sidebar />

            {/* Main area */}
            <div className="flex-1 flex flex-col min-h-screen">
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

                    {/* Admin avatar */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#ed6f00]/10 text-[#ed6f00] rounded-full px-4 py-1.5 text-sm font-semibold">
                            <UserCircleIcon className="w-5 h-5" />
                            {user?.name || 'Administrador'}
                        </div>
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
