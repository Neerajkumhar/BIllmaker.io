import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
            Hi, {user?.name || 'Admin'}
          </h2>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-indigo-100 items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
            <div className="text-right hidden xs:block">
              <p className="text-xs md:text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-[10px] md:text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
