import React, { useState, useEffect } from 'react';
import {
  Zap, Plus, Edit2, Trash2, Clock, Package,
  ChevronDown, ChevronUp, X, Search
} from 'lucide-react';
import FlashSaleService from '../../services/FlashSaleService';
import ProductService from '../../services/ProductService';
import { getImageUrl } from '../../utils/imageUtils';

const FlashSaleManagement = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [expandedSale, setExpandedSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    isActive: true
  });

  const [itemFormData, setItemFormData] = useState({
    flashSaleId: null,
    productId: null,
    discountPercent: 10,
    stockLimit: 100,
    originalPrice: 0,
    salePrice: 0
  });

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const response = await FlashSaleService.getAllFlashSales();
      // API returns { data: { flashSales: [...], pagination: {...} } }
      setFlashSales(response.data?.flashSales || response.flashSales || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      setFlashSales([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getProducts({ limit: 100 });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSale) {
        await FlashSaleService.updateFlashSale(editingSale.id, formData);
      } else {
        await FlashSaleService.createFlashSale(formData);
      }
      setShowModal(false);
      resetForm();
      fetchFlashSales();
    } catch (error) {
      console.error('Error saving flash sale:', error);
      alert('Lỗi khi lưu Flash Sale');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await FlashSaleService.addItem(itemFormData.flashSaleId, {
        productId: itemFormData.productId,
        discountPercent: itemFormData.discountPercent,
        stockLimit: itemFormData.stockLimit
      });
      setShowItemModal(false);
      resetItemForm();
      fetchFlashSales();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Lỗi khi thêm sản phẩm');
    }
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa Flash Sale này?')) return;
    try {
      await FlashSaleService.deleteFlashSale(id);
      fetchFlashSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
    }
  };

  const handleDeleteItem = async (flashSaleId, itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await FlashSaleService.deleteItem(flashSaleId, itemId);
      fetchFlashSales();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      name: sale.name,
      description: sale.description || '',
      startTime: formatDateTimeLocal(sale.startTime),
      endTime: formatDateTimeLocal(sale.endTime),
      isActive: sale.isActive
    });
    setShowModal(true);
  };

  const openAddItemModal = (flashSaleId) => {
    setItemFormData({ ...itemFormData, flashSaleId });
    setShowItemModal(true);
  };

  const selectProduct = (product) => {
    setItemFormData({
      ...itemFormData,
      productId: product.id,
      originalPrice: product.price,
      salePrice: Math.round(product.price * (1 - itemFormData.discountPercent / 100))
    });
    setSearchQuery(product.name);
    setSearchResults([]);
  };

  const updateDiscount = (percent) => {
    setItemFormData({
      ...itemFormData,
      discountPercent: percent,
      salePrice: Math.round(itemFormData.originalPrice * (1 - percent / 100))
    });
  };

  const resetForm = () => {
    setEditingSale(null);
    setFormData({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      isActive: true
    });
  };

  const resetItemForm = () => {
    setItemFormData({
      flashSaleId: null,
      productId: null,
      discountPercent: 10,
      stockLimit: 100,
      originalPrice: 0,
      salePrice: 0
    });
    setSearchQuery('');
  };

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getSaleStatus = (sale) => {
    const now = Date.now();
    const start = new Date(sale.startTime).getTime();
    const end = new Date(sale.endTime).getTime();

    if (!sale.isActive) return { status: 'inactive', label: 'Tạm dừng', color: 'bg-gray-100 text-gray-600' };
    if (now < start) return { status: 'upcoming', label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-600' };
    if (now > end) return { status: 'ended', label: 'Đã kết thúc', color: 'bg-red-100 text-red-600' };
    return { status: 'active', label: 'Đang diễn ra', color: 'bg-green-100 text-green-600' };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="text-red-500" />
          Quản lý Flash Sale
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus size={20} />
          Tạo Flash Sale
        </button>
      </div>

      {/* Flash Sales List */}
      <div className="space-y-4">
        {flashSales.map((sale) => {
          const statusInfo = getSaleStatus(sale);
          const isExpanded = expandedSale === sale.id;

          return (
            <div key={sale.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Sale Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{sale.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDateTime(sale.startTime)} - {formatDateTime(sale.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {sale.items?.length || 0} sản phẩm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteSale(sale.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Items */}
              {isExpanded && (
                <div className="border-t px-4 pb-4">
                  <div className="flex justify-between items-center py-3">
                    <h4 className="font-medium">Sản phẩm trong Flash Sale</h4>
                    <button
                      onClick={() => openAddItemModal(sale.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Plus size={16} />
                      Thêm sản phẩm
                    </button>
                  </div>

                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm">Sản phẩm</th>
                        <th className="px-3 py-2 text-center text-sm">Giá gốc</th>
                        <th className="px-3 py-2 text-center text-sm">Giảm</th>
                        <th className="px-3 py-2 text-center text-sm">Giá sale</th>
                        <th className="px-3 py-2 text-center text-sm">Đã bán/Giới hạn</th>
                        <th className="px-3 py-2 text-center text-sm">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sale.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={getImageUrl(item.product?.image)}
                                alt={item.product?.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="text-sm line-clamp-1">{item.product?.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center text-sm text-gray-500">
                            {formatPrice(item.originalPrice)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                              -{item.discountPercent}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-red-600">
                            {formatPrice(item.salePrice)}
                          </td>
                          <td className="px-3 py-2 text-center text-sm">
                            {item.soldCount}/{item.stockLimit}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleDeleteItem(sale.id, item.id)}
                              className="p-1 hover:bg-red-50 text-red-600 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!sale.items || sale.items.length === 0) && (
                        <tr>
                          <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                            Chưa có sản phẩm nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {flashSales.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Zap className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Chưa có Flash Sale nào
            </h3>
            <p className="text-gray-500 mb-4">
              Tạo Flash Sale đầu tiên để thu hút khách hàng
            </p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tạo Flash Sale
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Flash Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSale ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên Flash Sale</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm">Kích hoạt ngay</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingSale ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm sản phẩm vào Flash Sale</h2>
              <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Product Search */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Tìm sản phẩm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Nhập tên sản phẩm..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <img src={getImageUrl(product.image)} alt="" className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-red-600">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {itemFormData.productId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phần trăm giảm giá: {itemFormData.discountPercent}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="5"
                      value={itemFormData.discountPercent}
                      onChange={(e) => updateDiscount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5%</span>
                      <span>90%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Giá gốc:</span>
                      <span>{formatPrice(itemFormData.originalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-red-600">
                      <span>Giá sale:</span>
                      <span>{formatPrice(itemFormData.salePrice)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Số lượng giới hạn</label>
                    <input
                      type="number"
                      min="1"
                      value={itemFormData.stockLimit}
                      onChange={(e) => setItemFormData({ ...itemFormData, stockLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!itemFormData.productId}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSaleManagement;
