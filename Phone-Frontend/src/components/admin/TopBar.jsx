import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ activeTab, searchTerm, setSearchTerm, menuItems }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-md px-8 py-4 flex items-center justify-between border-b">
      <div>
        <h1 className="text-3xl font-bold text-dark">
          {menuItems.find((m) => m.id === activeTab)?.label || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-64">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent ml-2 flex-1 outline-none text-sm"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-6 border-l">
          <div className="text-right">
            <p className="font-semibold text-dark text-sm">{user?.fullName}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
