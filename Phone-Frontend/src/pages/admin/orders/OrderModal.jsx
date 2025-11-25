import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

const OrderModal = ({ order, onClose, onStatusUpdate, getStatusColor, getStatusIcon }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận', icon: '⏳' },
    { value: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
    { value: 'shipped', label: 'Đang giao hàng', icon: '🚚' },
    { value: 'delivered', label: 'Đã giao', icon: '📦' },
    { value: 'cancelled', label: 'Đã hủy', icon: '❌' },
  ];

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(order.orderId, selectedStatus);
      setTimeout(onClose, 500);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Chi Tiết Đơn Hàng</h2>
            <p className="text-sm opacity-90">{order.orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">MÃ ĐƠN HÀNG</p>
              <p className="text-lg font-bold text-primary">{order.orderId}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">NGÀY TẠO</p>
              <p className="text-lg font-bold">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">TRẠNG THÁI HIỆN TẠI</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 font-semibold">TỔNG TIỀN</p>
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.finalTotal || order.totalPrice)}
              </p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">📍 Thông Tin Giao Hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">TÊN NGƯỜI NHẬN</p>
                <p className="text-sm">{order.shippingInfo?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">EMAIL</p>
                <p className="text-sm">{order.shippingInfo?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">ĐIỆN THOẠI</p>
                <p className="text-sm">{order.shippingInfo?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">PHƯƠNG THỨC THANH TOÁN</p>
                <p className="text-sm">
                  {order.paymentMethod === 'credit-card' && '💳 Thẻ tín dụng/Ghi nợ'}
                  {order.paymentMethod === 'bank-transfer' && '🏦 Chuyển khoản ngân hàng'}
                  {order.paymentMethod === 'e-wallet' && '📱 Ví điện tử'}
                  {order.paymentMethod === 'cod' && '💵 Thanh toán khi nhận hàng'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 font-semibold">ĐỊA CHỈ CHI TIẾT</p>
                <p className="text-sm">
                  {order.shippingInfo?.address}, {order.shippingInfo?.ward}, {order.shippingInfo?.district}, {order.shippingInfo?.city}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">📦 Sản Phẩm</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Sản phẩm ID: {item.productId}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">💰 Chi Tiết Giá</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vận chuyển:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.shippingCost || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.tax || 0)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg">
                <span className="font-bold">Tổng cộng:</span>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.finalTotal || order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">🔄 Cập Nhật Trạng Thái</h3>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-lg">{status.icon}</span>
                  <span className="font-semibold flex-1">{status.label}</span>
                  {selectedStatus === status.value && (
                    <ChevronRight className="text-primary" size={20} />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang cập nhật...' : 'Cập nhật trạng thái'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
