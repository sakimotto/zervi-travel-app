import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium">{user.name || user.email}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <p className="font-medium text-gray-900">{user.name || 'User'}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>

            <div className="py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Settings size={16} className="mr-2" />
                Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;