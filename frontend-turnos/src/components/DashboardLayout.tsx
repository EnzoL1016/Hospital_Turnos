import { useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LogoutButton from './LogoutButton';

interface NavItem {
  name: string;
  href: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  colorClass: string;
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DashboardLayout = ({ title, navItems, children, colorClass }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav
        className={`fixed top-0 left-0 h-full w-64 p-4 ${colorClass} text-white shadow-xl flex flex-col z-40
                   transform transition-transform duration-300 ease-in-out
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <h1 className="text-3xl font-bold mt-12 mb-8 border-b border-white/30 pb-4">{title}</h1>
        <ul className="flex-grow space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={`w-full text-left block p-3 rounded-lg transition duration-150 ${
                  location.pathname === item.href
                    ? 'bg-white text-gray-800 font-semibold shadow-md'
                    : 'hover:bg-white/20'
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-t border-white/30">
          <p className="text-sm mb-2">Bienvenido/a, {useAuthStore.getState().user?.username}</p>
          <LogoutButton />
        </div>
      </nav>

      <main
        className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ease-in-out
                   ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;