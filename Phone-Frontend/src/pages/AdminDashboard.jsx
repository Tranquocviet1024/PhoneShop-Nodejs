import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  AlertCircle,
  Tag,
  Shield,
  FileText,
  Gift,
  Bell,
  Zap,
  AlertTriangle,
  Download,
} from 'lucide-react';

// Import components
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';
import DashboardTab from '../components/admin/DashboardTab';
import { CategoriesPage } from '../pages/admin/categories';
import { ProductsManagementPage } from '../pages/admin/products';
import { UsersManagementPage } from '../pages/admin/users';
import OrdersManagementPage from '../pages/admin/orders/OrdersManagementPage';
import RolesManagementPage from '../pages/admin/roles/RolesManagementPage';
import AuditLogsPage from '../pages/admin/audit/AuditLogsPage';
import UserPermissionsPage from '../pages/admin/permissions/UserPermissionsPage';
import CouponManagement from '../components/admin/CouponManagement';
import NotificationManagement from '../components/admin/NotificationManagement';
import FlashSaleManagement from '../components/admin/FlashSaleManagement';
import InventoryAlerts from '../components/admin/InventoryAlerts';
import ReportExport from '../components/admin/ReportExport';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'categories', label: 'Danh Mục', icon: Tag },
    { id: 'coupons', label: 'Mã giảm giá', icon: Gift },
    { id: 'flash-sale', label: 'Flash Sale', icon: Zap },
    { id: 'inventory', label: 'Tồn kho', icon: AlertTriangle },
    { id: 'reports', label: 'Báo cáo', icon: Download },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'roles', label: 'Quản lý Role', icon: Shield },
    { id: 'user-permissions', label: 'Quyền User', icon: Users },
    { id: 'audit', label: 'Nhật ký', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/admin/orders?limit=1000'),
          api.get('/admin/products?limit=1000'),
          api.get('/admin/users?limit=1000'),
        ]);

        // Calculate stats
        const orders = ordersRes.data?.data?.orders || [];
        const products = productsRes.data?.data?.products || [];
        const users = usersRes.data?.data?.users || [];

        // Calculate total revenue from completed orders
        const totalRevenue = orders
          .filter(order => order.paymentStatus === 'completed')
          .reduce((sum, order) => {
            const finalTotal = typeof order.finalTotal === 'string' 
              ? parseFloat(order.finalTotal) 
              : (order.finalTotal || 0);
            return sum + finalTotal;
          }, 0);

        setDashboardStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setDashboardStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          menuItems={menuItems}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && (
            <DashboardTab dashboardStats={dashboardStats} loading={loading} />
          )}

          {activeTab === 'products' && <ProductsManagementPage />}

          {activeTab === 'orders' && <OrdersManagementPage />}

          {activeTab === 'users' && <UsersManagementPage />}

          {activeTab === 'categories' && <CategoriesPage />}

          {activeTab === 'coupons' && <CouponManagement />}

          {activeTab === 'flash-sales' && <FlashSaleManagement />}

          {activeTab === 'inventory' && <InventoryAlerts />}

          {activeTab === 'reports' && <ReportExport />}

          {activeTab === 'notifications' && <NotificationManagement />}

          {activeTab === 'roles' && <RolesManagementPage />}

          {activeTab === 'user-permissions' && <UserPermissionsPage />}

          {activeTab === 'audit' && <AuditLogsPage />}

          {activeTab === 'settings' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b font-semibold">Cài Đặt</div>
                    <div className="space-y-1 p-4">
                      <button className="w-full text-left px-4 py-2 rounded-lg bg-primary text-white transition">
                        Chung
                      </button>
                      <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        Thanh Toán
                      </button>
                      <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        Email
                      </button>
                      <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        Bảo Mật
                      </button>
                    </div>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Cài Đặt Chung</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Tên Cửa Hàng</label>
                        <input
                          type="text"
                          placeholder="PhoneShop"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email Liên Hệ</label>
                        <input
                          type="email"
                          placeholder="contact@phoneshop.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Điện Thoại</label>
                        <input
                          type="tel"
                          placeholder="0123 456 789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition font-semibold">
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-blue-900">API Endpoints Cần Thiết</p>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• GET /admin/stats - Thống kê</li>
                        <li>• GET /admin/products - Danh sách sản phẩm</li>
                        <li>• GET /admin/orders - Danh sách đơn hàng</li>
                        <li>• GET /admin/users - Danh sách người dùng</li>
                        <li>• GET /admin/settings - Cài đặt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
    </div>
  );
};

export default AdminDashboard;
