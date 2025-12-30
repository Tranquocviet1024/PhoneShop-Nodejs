import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Scale, X, Plus, ArrowLeft } from 'lucide-react';
import ProductCompare from '../components/ProductCompare';
import ProductService from '../services/ProductService';
import { getImageUrl } from '../utils/imageUtils';

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load compare list from URL params or localStorage
    const idsFromUrl = searchParams.get('ids');
    if (idsFromUrl) {
      const ids = idsFromUrl.split(',').map(Number);
      setCompareList(ids);
    } else {
      const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
      setCompareList(stored);
    }
    fetchPopularProducts();
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const fetchPopularProducts = async () => {
    try {
      const response = await ProductService.getAllProducts({ limit: 12 });
      const data = response.data || response;
      setProducts(data?.products || data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const response = await ProductService.getAllProducts({ search: query });
        const data = response.data || response;
        setSearchResults(data?.products || data || []);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addToCompare = (productId) => {
    if (compareList.includes(productId)) {
      return;
    }
    if (compareList.length >= 4) {
      alert('Chỉ có thể so sánh tối đa 4 sản phẩm');
      return;
    }
    setCompareList([...compareList, productId]);
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(id => id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProductInfo = (productId) => {
    return products.find(p => p.id === productId) || 
           searchResults.find(p => p.id === productId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/products" className="p-2 hover:bg-gray-200 rounded-full">
              <ArrowLeft size={24} />
            </Link>
            <Scale className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold">So sánh sản phẩm</h1>
          </div>

          {compareList.length >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Scale size={20} />
              So sánh ngay ({compareList.length})
            </button>
          )}
        </div>

        {/* Compare Slots */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Sản phẩm so sánh ({compareList.length}/4)
            </h2>
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compareList.map((productId) => {
              const product = getProductInfo(productId);
              return (
                <div
                  key={productId}
                  className="relative bg-gray-50 rounded-lg p-4 group"
                >
                  <button
                    onClick={() => removeFromCompare(productId)}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                  {product ? (
                    <>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-32 object-contain mb-2"
                      />
                      <h3 className="text-sm font-medium line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-red-600 font-bold text-sm mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </>
                  ) : (
                    <div className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded"></div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty Slots */}
            {Array(4 - compareList.length).fill(null).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px]"
              >
                <Plus className="text-gray-400 mb-2" size={32} />
                <p className="text-gray-400 text-sm text-center">
                  Thêm sản phẩm
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tìm sản phẩm để so sánh</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Nhập tên sản phẩm..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-10">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      addToCompare(product.id);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-red-600 text-sm">{formatPrice(product.price)}</p>
                    </div>
                    {compareList.includes(product.id) ? (
                      <span className="text-green-600 text-sm">Đã thêm</span>
                    ) : (
                      <Plus className="text-blue-600" size={20} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm phổ biến</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-32 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition"
                >
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-28 object-contain mb-2"
                    />
                    <h3 className="text-sm font-medium line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-red-600 font-bold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() => addToCompare(product.id)}
                    disabled={compareList.includes(product.id)}
                    className={`w-full mt-2 px-3 py-1 rounded text-sm flex items-center justify-center gap-1 ${
                      compareList.includes(product.id)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {compareList.includes(product.id) ? (
                      'Đã thêm'
                    ) : (
                      <>
                        <Plus size={14} />
                        So sánh
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && compareList.length >= 2 && (
        <ProductCompare
          productIds={compareList}
          onClose={() => setShowComparison(false)}
          onRemoveProduct={removeFromCompare}
        />
      )}
    </div>
  );
};

export default ComparePage;
