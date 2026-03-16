import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <h1 className="text-xl font-bold text-white">VibeChat</h1>

          {user && (
            <div className="flex items-center space-x-2">
              {/* Avatar + name */}
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border-2 border-white shrink-0"
              />
              <span className="font-medium text-sm hidden sm:block">{user.displayName}</span>

              {/* Logout - icon only on mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}