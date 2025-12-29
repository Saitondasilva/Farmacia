import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-300 shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              UCID-STP - Unidade de Cidadania por Investimentos ou Doação
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/perfil"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{user?.nome}</span>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {user?.role}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
