import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CompareService from '../services/CompareService';
import { getImageUrl } from '../utils/imageUtils';

const ProductCompare = ({ productIds = [], onClose, onRemoveProduct }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productIds.length >= 2) {
      fetchComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await CompareService.compareProducts(productIds);
      setComparison(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu so sánh');
      console.error('Error fetching comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu so sánh...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-red-500">{error || 'Không có dữ liệu'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">So sánh sản phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Products Header Row */}
        <div className="grid border-b" style={{ gridTemplateColumns: `200px repeat(${comparison.products.length}, 1fr)` }}>
          <div className="p-4 bg-gray-50 font-semibold">Sản phẩm</div>
          {comparison.products.map((product) => (
            <div key={product.id} className="p-4 text-center relative group">
              {onRemoveProduct && (
                <button
                  onClick={() => onRemoveProduct(product.id)}
                  className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              )}
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-32 h-32 object-cover mx-auto rounded-lg"
              />
              <h3 className="font-semibold mt-2 line-clamp-2">{product.name}</h3>
              <p className="text-red-600 font-bold mt-1">{formatPrice(product.price)}</p>
              {product.originalPrice > product.price && (
                <p className="text-gray-400 line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Basic Comparison */}
        <div className="border-b">
          <div className="bg-blue-50 p-3 font-semibold text-blue-800">Thông tin cơ bản</div>
          {comparison.basicComparison.map((row, index) => (
            <div
              key={index}
              className="grid border-b last:border-b-0"
              style={{ gridTemplateColumns: `200px repeat(${comparison.products.length}, 1fr)` }}
            >
              <div className="p-3 bg-gray-50 font-medium">{row.name}</div>
              {comparison.products.map((product) => (
                <div key={product.id} className="p-3 text-center">
                  {row.name === 'Giá bán' || row.name === 'Giá gốc'
                    ? formatPrice(row[`product_${product.id}`])
                    : row[`product_${product.id}`]}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Specifications */}
        {comparison.specifications.length > 0 && (
          <div>
            <div className="bg-green-50 p-3 font-semibold text-green-800">Thông số kỹ thuật</div>
            {comparison.specifications.map((row, index) => (
              <div
                key={index}
                className="grid border-b last:border-b-0"
                style={{ gridTemplateColumns: `200px repeat(${comparison.products.length}, 1fr)` }}
              >
                <div className="p-3 bg-gray-50 font-medium">{row.name}</div>
                {comparison.products.map((product) => (
                  <div key={product.id} className="p-3 text-center">
                    {row[`product_${product.id}`] || '-'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCompare;
