import React from 'react';
import { DollarSign, ShoppingCart, Package, Users, AlertCircle, Loader } from 'lucide-react';

const DashboardTab = ({ dashboardStats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-primary" size={40} />
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold text-dark mt-2">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(dashboardStats.totalRevenue || 0)}
              </p>
              <p className="text-green-600 text-sm mt-1">📈 +0% từ tháng trước</p>
            </div>
            <DollarSign size={40} className="text-primary/20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Đơn Hàng</p>
              <p className="text-3xl font-bold text-dark mt-2">{dashboardStats.totalOrders || 0}</p>
              <p className="text-green-600 text-sm mt-1">📈 +0% từ tuần trước</p>
            </div>
            <ShoppingCart size={40} className="text-accent/20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sản Phẩm</p>
              <p className="text-3xl font-bold text-dark mt-2">{dashboardStats.totalProducts || 0}</p>
              <p className="text-blue-600 text-sm mt-1">📦 Trong kho</p>
            </div>
            <Package size={40} className="text-blue-500/20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Khách Hàng</p>
              <p className="text-3xl font-bold text-dark mt-2">{dashboardStats.totalUsers || 0}</p>
              <p className="text-purple-600 text-sm mt-1">👥 Tổng cộng</p>
            </div>
            <Users size={40} className="text-purple-500/20" />
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-green-600 flex-shrink-0" size={20} />
        <div>
          <p className="font-semibold text-green-900">✅ Kết nối Backend Thành Công</p>
          <p className="text-sm text-green-800">
            Đã tải thành công: {dashboardStats.totalOrders} đơn hàng, {dashboardStats.totalProducts} sản phẩm, {dashboardStats.totalUsers} khách hàng
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
