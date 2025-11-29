import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Clock,
  Users,
  Calendar,
  Dices,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    to: '/courts',
    icon: <MapPin className="h-5 w-5" />,
    label: 'Pistes',
  },
  {
    to: '/timeslots',
    icon: <Clock className="h-5 w-5" />,
    label: 'Horaris',
  },
  {
    to: '/users',
    icon: <Users className="h-5 w-5" />,
    label: 'Usuaris',
  },
  {
    to: '/bookings',
    icon: <Calendar className="h-5 w-5" />,
    label: 'Reserves',
  },
  {
    to: '/lottery',
    icon: <Dices className="h-5 w-5" />,
    label: 'Sortejos',
  },
  {
    to: '/stats',
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Estadístiques',
  },
];

interface AdminSidebarProps {
  isMobileMenuOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileMenuOpen, onClose }) => {
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
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0',
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
