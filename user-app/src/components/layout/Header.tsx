import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Button } from '../ui/button';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button and Logo */}
          <div className="flex items-center space-x-2">
            {onMenuToggle && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={onMenuToggle}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl font-bold text-primary-600">
                Pàdel
              </div>
            </Link>
          </div>

          {/* User Info and Actions */}
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500">
                    {user.type === 'MEMBER' ? 'Soci' : 'No Soci'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sortir</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
