import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { CreditCard, QrCode, Loader, CheckCircle, XCircle } from 'lucide-react';

const PayOSPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, totalAmount } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const handleCreatePayment = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy thông tin đơn hàng');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate idempotency key
      const idempotencyKey = `${orderId}-${Date.now()}`;

      const response = await api.post('/payments/payos/create', {
        orderId,
        description: `Thanh toán đơn hàng ${orderId}`,
        idempotencyKey
      });

      const data = response.data?.data;
      setPaymentData(data);

      // Redirect to PayOS checkout page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.response?.data?.message || 'Lỗi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      handleCreatePayment();
    }
  }, [orderId, handleCreatePayment]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">Không tìm thấy thông tin đơn hàng</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition"
          >
            Về trang đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán PayOS</h1>
          <p className="text-gray-600">Mã đơn hàng: <span className="font-semibold">{orderId}</span></p>
          <p className="text-2xl font-bold text-primary mt-4">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(totalAmount || 0)}
          </p>
        </div>

        {/* Status Message */}
        {(loading || error) && (
          <div
            className={`rounded-lg p-4 mb-6 border flex items-center gap-2 ${
              error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            {error ? <XCircle size={20} /> : <Loader className="animate-spin" size={20} />}
            <span>
              {error || 'Đang tạo liên kết thanh toán PayOS, vui lòng đợi...'}
            </span>
          </div>
        )}

        {/* Payment Options */}
        {!paymentData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
            
            <div className="space-y-4">
              {/* PayOS QR Code */}
              <button
                onClick={handleCreatePayment}
                disabled={loading}
                className="w-full border-2 border-primary rounded-lg p-6 hover:bg-blue-50 transition flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <QrCode size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Thanh toán QR Code</h3>
                    <p className="text-sm text-gray-600">Quét mã QR để thanh toán nhanh chóng</p>
                  </div>
                </div>
                {loading && <Loader className="animate-spin text-primary" size={24} />}
              </button>

              {/* PayOS Web */}
              <button
                onClick={handleCreatePayment}
                disabled={loading}
                className="w-full border-2 border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <CreditCard size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Thanh toán trực tuyến</h3>
                    <p className="text-sm text-gray-600">Chuyển hướng đến trang thanh toán PayOS</p>
                  </div>
                </div>
                {loading && <Loader className="animate-spin text-primary" size={24} />}
              </button>
            </div>
          </div>
        )}

        {/* Payment Data (QR Code) */}
        {paymentData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Link thanh toán đã tạo</h2>
              <p className="text-gray-600 mb-6">Quét mã QR hoặc truy cập link để thanh toán</p>

              {/* QR Code */}
              {paymentData.qrCode && (
                <div className="mb-6">
                  <img
                    src={paymentData.qrCode}
                    alt="PayOS QR Code"
                    className="mx-auto max-w-xs w-full"
                  />
                </div>
              )}

              {/* Payment Link */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Link thanh toán:</p>
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {paymentData.checkoutUrl}
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = paymentData.checkoutUrl}
                  className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-accent transition font-semibold"
                >
                  Chuyển đến trang thanh toán
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Quay lại đơn hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayOSPaymentPage;
