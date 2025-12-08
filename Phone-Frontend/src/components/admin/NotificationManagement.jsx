import React, { useState } from 'react';
import NotificationService from '../../services/NotificationService';
import { Send, Bell, Gift, AlertCircle } from 'lucide-react';

const NotificationManagement = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    couponCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await NotificationService.sendPromotionNotification(
        formData.title,
        formData.message,
        formData.couponCode || null
      );
      setSuccess('Đã gửi thông báo khuyến mãi thành công!');
      setFormData({ title: '', message: '', couponCode: '' });
    } catch (err) {
      setError(err.message || 'Không thể gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      title: 'Flash Sale hôm nay',
      message: 'Giảm giá sốc lên đến 50% cho tất cả điện thoại! Chỉ trong hôm nay. Nhanh tay kẻo lỡ!',
      icon: '⚡'
    },
    {
      title: 'Mã giảm giá đặc biệt',
      message: 'Sử dụng mã giảm giá để được giảm ngay khi thanh toán. Số lượng có hạn!',
      icon: '🎁'
    },
    {
      title: 'Sản phẩm mới về',
      message: 'iPhone 15 Pro Max và Samsung Galaxy S24 Ultra đã có hàng! Đặt ngay để nhận ưu đãi.',
      icon: '📱'
    },
    {
      title: 'Miễn phí vận chuyển',
      message: 'Miễn phí vận chuyển cho tất cả đơn hàng từ 500.000đ. Áp dụng toàn quốc!',
      icon: '🚚'
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Gửi thông báo khuyến mãi</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <Gift size={20} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề thông báo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Flash Sale cuối tuần!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung thông báo *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Nhập nội dung thông báo khuyến mãi..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                  placeholder="VD: FLASHSALE50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nếu có mã giảm giá, hệ thống sẽ hiển thị trong thông báo
                </p>
              </div>

              {/* Preview */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước thông báo</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎁</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {formData.title || 'Tiêu đề thông báo'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                      </p>
                      {formData.couponCode && (
                        <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-mono">
                          Mã: {formData.couponCode}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Vừa xong</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Send size={20} />
                {loading ? 'Đang gửi...' : 'Gửi thông báo đến tất cả người dùng'}
              </button>
            </form>
          </div>
        </div>

        {/* Templates */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Mẫu thông báo</h3>
            <p className="text-sm text-gray-500 mb-4">Chọn một mẫu để bắt đầu nhanh</p>
            
            <div className="space-y-3">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{template.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng số người dùng</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Thông báo đã gửi hôm nay</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ đọc</span>
                <span className="font-semibold">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
