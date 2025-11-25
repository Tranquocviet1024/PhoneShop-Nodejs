import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, Clock, CheckCircle, Truck, Package } from 'lucide-react';
import AdminOrderService from '../../../services/AdminOrderService';
import OrderTable from './OrderTable';
import OrderModal from './OrderModal';

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (filterStatus) {
        params.status = filterStatus;
      }

      console.log('📋 Fetching admin orders with params:', params);
      const response = await AdminOrderService.getOrders(params);
      
      console.log('📦 Admin orders response:', response);

      if (response.success) {
        // Handle different response structures from backend
        let ordersData = response.data?.orders || response.data?.data?.orders || response.data || [];
        
        // Ensure it's an array
        if (!Array.isArray(ordersData)) {
          ordersData = [];
        }

        console.log('✅ Parsed orders:', ordersData);
        setOrders(ordersData);
        setError('');
      } else {
        setError(response.message || 'Lỗi khi lấy danh sách đơn hàng');
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter & Sort
  let filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingInfo?.phone?.includes(searchTerm);

    return matchSearch;
  });

  // Sort
  filteredOrders = filteredOrders.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderCode, newStatus) => {
    try {
      const response = await AdminOrderService.updateOrderStatus(orderCode, {
        status: newStatus,
      });

      if (response.success) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order.orderId === response.data.orderId
              ? { ...order, status: response.data.status }
              : order
          )
        );
        setSelectedOrder((prev) =>
          prev?.orderId === response.data.orderId
            ? { ...prev, status: response.data.status }
            : prev
        );
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái');
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này không?')) {
      try {
        const response = await AdminOrderService.cancelOrder(orderId);

        if (response.success) {
          setOrders(orders.filter((order) => order.id !== orderId));
          setSelectedOrder(null);
          setShowModal(false);
          setError('');
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi hủy đơn hàng');
        console.error('Error deleting order:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <Package size={16} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ChevronLeft className="cursor-pointer hover:text-primary" size={24} />
            <h1 className="text-4xl font-bold">📦 Quản Lý Đơn Hàng</h1>
          </div>
          <p className="text-gray-600">Quản lý tất cả đơn hàng của khách hàng</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo Order ID, tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-primary"
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipped">Đang giao hàng</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-primary"
            >
              <option value="createdAt">Sắp xếp: Ngày tạo</option>
              <option value="orderId">Sắp xếp: Order ID</option>
              <option value="status">Sắp xếp: Trạng thái</option>
              <option value="finalTotal">Sắp xếp: Tổng tiền</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin">⏳</div> Đang tải...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy đơn hàng nào
            </div>
          ) : (
            <OrderTable
              orders={filteredOrders}
              onView={handleViewOrder}
              onDelete={handleDeleteOrder}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">Trang {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:border-primary"
            >
              Tiếp
            </button>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      )}
    </main>
  );
};

export default OrdersManagementPage;
