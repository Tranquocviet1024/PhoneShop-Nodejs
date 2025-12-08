import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WishlistService from '../services/WishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await WishlistService.getWishlist();
      // API returns { data: { items: [...], pagination: {...} } }
      setWishlist(response.data?.items || []);
    } catch (err) {
      setError('Không thể tải danh sách yêu thích');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => {
        const itemProductId = item.productId || item.product?.id || item.Product?.id;
        return itemProductId !== productId;
      }));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      // Optionally remove from wishlist after adding to cart
      // await handleRemoveFromWishlist(product.id);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
      try {
        await WishlistService.clearWishlist();
        setWishlist([]);
      } catch (err) {
        console.error('Error clearing wishlist:', err);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
            <p className="text-gray-600 mt-1">
              {wishlist.length} sản phẩm
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm sản phẩm yêu thích của bạn để mua sau!
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product || item.Product || item;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image || product.imageUrl || '/placeholder-phone.png'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                      />
                    </Link>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition"
                      title="Xóa khỏi yêu thích"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {/* Stock badge */}
                    {product.stock === 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Hết hàng
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Còn {product.stock} sản phẩm
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {product.rating != null && (
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">
                          {Number(product.rating).toFixed(1)} ({product.reviewCount || 0} đánh giá)
                        </span>
                      </div>
                    )}

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
