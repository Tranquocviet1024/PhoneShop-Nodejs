import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderCode = searchParams.get('orderCode');
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState(orderCode ? 'loading' : 'error');
  const [message, setMessage] = useState(orderCode ? 'Đang cập nhật trạng thái đơn hàng...' : 'Không tìm thấy mã thanh toán.');

  useEffect(() => {
    if (!orderCode) {
      return;
    }

    let isMounted = true;

    const cancelPayment = async () => {
      try {
        await api.post(`/payments/payos/${orderCode}/cancel`, {
          cancellationReason: 'Người dùng hủy trên PayOS'
        });

        if (isMounted) {
          setStatus('success');
          setMessage('Thanh toán đã được hủy và đơn hàng của bạn đã được cập nhật.');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
        }
      }
    };

    cancelPayment();

    return () => {
      isMounted = false;
    };
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {status === 'loading' ? (
          <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto mb-6" />
        ) : (
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán đã hủy</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        {orderCode && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Mã PayOS</p>
            <p className="text-lg font-bold text-gray-800">{orderCode}</p>
            {orderId && (
              <p className="text-xs text-gray-500 mt-1">Mã đơn hàng: {orderId}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition font-semibold"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
