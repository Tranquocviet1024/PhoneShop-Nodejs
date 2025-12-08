import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, DollarSign, RefreshCcw, XCircle } from 'lucide-react';
import OrderService from '../services/OrderService';
import OrderTracking from '../components/OrderTracking';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('vi-VN', { hour12: false }) : '—';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await OrderService.getOrders();
      const data = response?.data?.orders || [];
      setOrders(data);
      if (!selectedOrder && data.length > 0) {
        setSelectedOrder(data[0]);
      } else if (selectedOrder) {
        const updated = data.find((order) => order.orderId === selectedOrder.orderId);
        setSelectedOrder(updated || data[0] || null);
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setCancellingOrder(orderToCancel.orderId);
      setError('');
      
      const response = await OrderService.cancelOrder(orderToCancel.orderId);
      
      if (response.success) {
        // Reload danh sách đơn hàng
        await loadOrders();
        setShowCancelModal(false);
        setOrderToCancel(null);
      } else {
        setError(response.message || 'Không thể hủy đơn hàng');
      }
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setCancellingOrder(null);
    }
  };

  // Mở modal xác nhận hủy
  const openCancelModal = (order, e) => {
    e.stopPropagation(); // Ngăn click vào card
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  // Kiểm tra đơn hàng có thể hủy không
  const canCancelOrder = (order) => {
    // Chỉ cho phép hủy đơn hàng pending hoặc confirmed
    return ['pending', 'confirmed'].includes(order.status?.toLowerCase());
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStatusBadge = (status, map) => {
    if (!status) return null;
    const normalized = status.toLowerCase();
    const styles = map[normalized] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles}`}>
        {normalized}
      </span>
    );
  };

  const renderItems = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.name}`} className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-gray-500">x{item.quantity}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark">Đơn hàng của tôi</h1>
            <p className="text-gray-600 mt-1">Theo dõi tình trạng và chi tiết các đơn hàng bạn đã đặt.</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition disabled:opacity-60"
          >
            <RefreshCcw size={18} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 mt-4">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500">Hãy tiếp tục mua sắm để thấy đơn hàng của bạn ở đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className={`bg-white rounded-lg shadow p-5 border transition cursor-pointer ${
                    selectedOrder?.orderId === order.orderId ? 'border-primary shadow-lg' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs uppercase text-gray-500">Mã đơn</p>
                      <p className="text-lg font-bold text-dark">{order.orderId}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {renderStatusBadge(order.status, statusColors)}
                      {renderStatusBadge(order.paymentStatus, paymentStatusColors)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {formatDateTime(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      {formatCurrency(order.finalTotal)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      {order.items?.length || 0} sản phẩm
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={16} />
                      {order.shippingInfo?.city || '—'}
                    </div>
                  </div>

                  {/* Nút hủy đơn hàng */}
                  {canCancelOrder(order) && (
                    <button
                      onClick={(e) => openCancelModal(order, e)}
                      disabled={cancellingOrder === order.orderId}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      {cancellingOrder === order.orderId ? 'Đang hủy...' : 'Hủy đơn hàng'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {selectedOrder && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
                  {renderStatusBadge(selectedOrder.status, statusColors)}
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold mb-2">Thông tin giao hàng</h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-gray-800">{selectedOrder.shippingInfo?.fullName}</p>
                      <p>{selectedOrder.shippingInfo?.phone}</p>
                      <p>{selectedOrder.shippingInfo?.email}</p>
                      <p>
                        {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.ward},
                        {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.city}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
                    {renderItems(selectedOrder.items)}
                  </section>

                  <section className="text-sm text-gray-600 border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vận chuyển</span>
                      <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thuế</span>
                      <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-dark">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(selectedOrder.finalTotal)}</span>
                    </div>
                  </section>

                  {/* Nút hủy đơn hàng trong chi tiết */}
                  {canCancelOrder(selectedOrder) && (
                    <section className="border-t pt-4">
                      <button
                        onClick={(e) => openCancelModal(selectedOrder, e)}
                        disabled={cancellingOrder === selectedOrder.orderId}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        {cancellingOrder === selectedOrder.orderId ? 'Đang hủy đơn hàng...' : 'Hủy đơn hàng này'}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Bạn chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái "Chờ xử lý" hoặc "Đã xác nhận"
                      </p>
                    </section>
                  )}

                  {/* Order Tracking */}
                  <section className="border-t pt-4">
                    <OrderTracking orderId={selectedOrder.orderId} />
                  </section>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal xác nhận hủy đơn hàng */}
        {showCancelModal && orderToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận hủy đơn hàng</h3>
                  <p className="text-sm text-gray-500">Mã đơn: {orderToCancel.orderId}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tổng tiền:</span> {formatCurrency(orderToCancel.finalTotal)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Số sản phẩm:</span> {orderToCancel.items?.length || 0}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Không, giữ lại
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {cancellingOrder ? 'Đang hủy...' : 'Có, hủy đơn'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
