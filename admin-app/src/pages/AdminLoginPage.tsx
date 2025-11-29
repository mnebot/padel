import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminLoginForm } from '../components/auth/AdminLoginForm';

export const AdminLoginPage: React.FC = () => {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Navigation will happen via the useEffect above
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestió Reserves Pàdel
          </h1>
          <p className="mt-2 text-gray-600">
            Panell d'administració
          </p>
        </div>
        <AdminLoginForm onSubmit={handleLogin} error={error} />
      </div>
    </div>
  );
};
