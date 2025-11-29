import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Clock, History } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: <Home className="h-5 w-5" />,
    label: 'Inici',
  },
  {
    to: '/bookings',
    icon: <Calendar className="h-5 w-5" />,
    label: 'Les Meves Reserves',
  },
  {
    to: '/bookings/new',
    icon: <Clock className="h-5 w-5" />,
    label: 'Nova Reserva',
  },
  {
    to: '/history',
    icon: <History className="h-5 w-5" />,
    label: 'Historial',
  },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transform transition-transform duration-200 ease-in-out md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
