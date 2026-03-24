import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, FileText, CreditCard, BarChart3, X } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const menu = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Services', path: '/services', icon: Briefcase },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col shadow-xl lg:shadow-none">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">BillMaker<span className="text-indigo-400">.io</span></h1>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t text-sm text-gray-500">
        &copy; 2026 Visuark Digital Services
      </div>
    </div>
  );
};

export default Sidebar;
