import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, CheckCircle, RefreshCw } from 'lucide-react';
import InventoryService from '../../services/InventoryService';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.all([
        InventoryService.getAlerts({ status: filter }),
        InventoryService.getStats()
      ]);
      setAlerts(alertsRes.data?.alerts || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInventory = async () => {
    try {
      await InventoryService.checkInventory(10);
      fetchData();
    } catch (error) {
      console.error('Error checking inventory:', error);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await InventoryService.resolveAlert(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'out_of_stock':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'low_stock':
        return <Package className="text-orange-500" size={20} />;
      default:
        return <Package className="text-blue-500" size={20} />;
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'out_of_stock':
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Hết hàng</span>;
      case 'low_stock':
        return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">Sắp hết</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">{type}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hết hàng</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <div className="mt-2 bg-red-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${stats.stockHealth?.outOfStock || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <Package className="text-orange-500" size={40} />
            </div>
            <div className="mt-2 bg-orange-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${stats.stockHealth?.lowStock || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Còn hàng</p>
                <p className="text-2xl font-bold text-green-600">{stats.healthyStock}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <div className="mt-2 bg-green-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.stockHealth?.healthy || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Cảnh báo tồn kho
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="unresolved">Chưa xử lý</option>
              <option value="resolved">Đã xử lý</option>
              <option value="all">Tất cả</option>
            </select>

            <button
              onClick={handleCheckInventory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={18} />
              Kiểm tra kho
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Loại</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Tồn kho</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ngưỡng</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Ngày tạo</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={alert.product?.image}
                        alt={alert.product?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{alert.product?.name}</p>
                        <p className="text-sm text-gray-500">{alert.product?.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.alertType)}
                      {getAlertBadge(alert.alertType)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${alert.currentStock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {alert.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{alert.threshold}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-sm">
                    {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        Đã xử lý
                      </button>
                    )}
                    {alert.isResolved && (
                      <span className="text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle size={16} />
                        Đã xử lý
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <CheckCircle className="mx-auto mb-2 text-green-500" size={40} />
                    Không có cảnh báo nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;
