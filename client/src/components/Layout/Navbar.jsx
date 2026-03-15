import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRightStartOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">VibeChat</h1>
      </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="font-medium">{user.displayName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="h-6 w-6" />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}