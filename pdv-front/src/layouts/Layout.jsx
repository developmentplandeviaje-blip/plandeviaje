import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const Layout = () => {
    return (
        <div className="min-h-screen text-gray-900 font-sans relative">
            <div className="app-background" aria-hidden="true" />
            <div className="relative z-10">
                <Header />
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
