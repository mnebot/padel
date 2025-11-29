import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {currentYear} Gestió de Reserves de Pàdel. Tots els drets reservats.
          </div>
          <div className="flex space-x-4 text-sm text-gray-600">
            <a href="#" className="hover:text-primary-600 transition-colors">
              Ajuda
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Contacte
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors">
              Privacitat
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
