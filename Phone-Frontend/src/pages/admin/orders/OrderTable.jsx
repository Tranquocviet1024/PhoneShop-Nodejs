import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

const OrderTable = ({ orders, onView, onDelete, getStatusColor, getStatusIcon }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Khách Hàng
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Số ĐT
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Trạng Thái
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Tổng Tiền
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Ngày Tạo
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
              Hành Động
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id || index} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm font-semibold text-primary">
                {order.orderId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {order.shippingInfo?.fullName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {order.shippingInfo?.email}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {order.shippingInfo?.phone}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status === 'pending' && 'Chờ xác nhận'}
                  {order.status === 'confirmed' && 'Đã xác nhận'}
                  {order.status === 'shipped' && 'Đang giao'}
                  {order.status === 'delivered' && 'Đã giao'}
                  {order.status === 'cancelled' && 'Đã hủy'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.finalTotal || order.totalPrice)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onView(order)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => onDelete(order.orderId)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Hủy đơn hàng"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
