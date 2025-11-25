import React from 'react';
import { Eye, ShoppingCart } from 'lucide-react';

const OrdersTab = ({ 
  recentOrders, 
  onStatusChange 
}) => {
  return (
    <div>
      <div className="mb-6 flex gap-4">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Tìm đơn hàng..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">
          <option>Tất cả trạng thái</option>
          <option>Chờ xử lý</option>
          <option>Đã gửi</option>
          <option>Đã giao</option>
          <option>Đã hủy</option>
        </select>
      </div>

      {recentOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-dark">Mã Đơn</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Khách Hàng</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Tổng Tiền</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Trạng Thái</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Ngày</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6 font-semibold text-primary">{order.orderId}</td>
                  <td className="py-3 px-6">{order.User?.fullName || order.customer || 'N/A'}</td>
                  <td className="py-3 px-6 font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(parseFloat(order.totalPrice) || 0)}
                  </td>
                  <td className="py-3 px-6">
                    <select 
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipped">Đã gửi</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-6 flex gap-2">
                    <button className="text-primary hover:text-accent transition p-2 hover:bg-gray-100 rounded">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Không có đơn hàng</p>
          <p className="text-gray-500 text-sm mt-1">Cần kết nối API: GET /admin/orders</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
