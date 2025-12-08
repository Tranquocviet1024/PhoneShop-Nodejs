import React from 'react';
import { Menu, X, LogOut, BarChart3, Package, ShoppingCart, Users, Settings, Tag, Shield, FileText, Gift, Bell, Zap, AlertTriangle, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, onLogout }) => {
  const { user } = useAuth();

  // Define menu items với required permissions
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: 'view_dashboard' },
    { id: 'products', label: 'Sản phẩm', icon: Package, permission: 'read_products' },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart, permission: 'view_orders' },
    { id: 'users', label: 'Người dùng', icon: Users, permission: 'view_users' },
    { id: 'categories', label: 'Danh Mục', icon: Tag, permission: 'view_categories' },
    { id: 'coupons', label: 'Mã giảm giá', icon: Gift, permission: 'manage_coupons' },
    { id: 'notifications', label: 'Thông báo', icon: Bell, permission: 'send_notifications' },
    { id: 'flash-sales', label: 'Flash Sale', icon: Zap, permission: 'manage_flash_sales' },
    { id: 'inventory', label: 'Cảnh báo kho', icon: AlertTriangle, permission: 'view_inventory_alerts' },
    { id: 'reports', label: 'Báo cáo', icon: Download, permission: 'view_reports' },
    { id: 'roles', label: 'Quản lý Role', icon: Shield, permission: 'view_roles' },
    { id: 'user-permissions', label: 'Quyền User', icon: Users, permission: 'grant_permission' },
    { id: 'audit', label: 'Nhật ký', icon: FileText, permission: 'view_audit_logs' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, permission: null }, // Ai cũng thấy
  ];

  // Filter menu items based on user permissions
  // Check if user has the required permission for each menu item
  const userPermissions = user?.permissions || [];
  const menuItems = allMenuItems.filter(item => {
    // Items without permission requirement are visible to all
    if (!item.permission) return true;
    
    // Check if user has the required permission
    return userPermissions.includes(item.permission);
  });

  return (
    <div
      className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-dark text-white transition-all duration-300 flex flex-col shadow-lg`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <div className={`${!isSidebarOpen && 'hidden'} flex items-center gap-2`}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📱</span>
          </div>
          <div>
            <span className="font-bold text-lg">Admin</span>
            <p className="text-xs text-gray-400">PhoneShop</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hover:bg-gray-700 p-2 rounded-lg transition"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            title={!isSidebarOpen ? item.label : ''}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className={`${!isSidebarOpen && 'hidden'} mb-4 p-3 bg-gray-700 rounded-lg`}>
          <p className="text-sm font-semibold">{user?.fullName}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
          title={!isSidebarOpen ? 'Đăng xuất' : ''}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>
            Đăng xuất
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
