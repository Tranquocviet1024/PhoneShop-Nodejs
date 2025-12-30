import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, Shield, Heart, Share2, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import WishlistService from '../services/WishlistService';
import RecentlyViewedService from '../services/RecentlyViewedService';
import api from '../api/axiosConfig';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status when product loads
  useEffect(() => {
    if (user && id) {
      checkWishlistStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // Track product view
  useEffect(() => {
    if (product) {
      trackProductView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const trackProductView = async () => {
    if (user) {
      try {
        await RecentlyViewedService.trackView(product.id);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    } else {
      // Store in localStorage for guests
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = viewed.filter(p => p.id !== product.id);
      filtered.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 20)));
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await WishlistService.checkWishlist(id);
      setIsFavorite(response.data?.inWishlist || false);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isFavorite) {
        await WishlistService.removeFromWishlist(id);
        setIsFavorite(false);
      } else {
        await WishlistService.addToWishlist(id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      console.log('Product detail response:', response.data);
      
      let product = response.data;
      // Backend có thể trả về nested trong data property
      if (product?.data && typeof product.data === 'object' && !Array.isArray(product.data)) {
        product = product.data;
      }
      
      console.log('Processed product:', product);
      setProduct(product);
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Sản phẩm không tìm thấy</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-accent transition"
          >
            <ChevronLeft size={20} />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8 mb-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Category */}
            {product.category && (
              <p className="text-sm text-primary font-bold uppercase mb-2">
                {typeof product.category === 'string' ? product.category : product.category.name}
              </p>
            )}

            {/* Name */}
            <h1 className="text-3xl font-bold text-dark mb-4">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < product.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                {product.reviews && (
                  <span className="text-gray-600">({product.reviews} đánh giá)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="text-lg font-bold text-accent">
                  Tiết kiệm {product.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Stock Status */}
            {product.stock !== undefined && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                {product.stock > 0 ? (
                  <p className="text-green-600 font-semibold">
                    Có sẵn ({product.stock} sản phẩm)
                  </p>
                ) : (
                  <p className="text-red-600 font-semibold">Hết hàng</p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock !== undefined && (
              <div className="flex items-center gap-4 mb-6">
                <label className="font-semibold">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-primary font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 text-primary font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock !== undefined && product.stock === 0}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`px-6 py-3 border-2 rounded-lg font-bold transition ${
                  isFavorite 
                    ? 'border-red-500 text-red-500 hover:bg-red-50' 
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-current text-red-500' : ''}
                />
              </button>
              <button className="px-6 py-3 border-2 border-gray-300 text-dark rounded-lg font-bold hover:bg-gray-100 transition">
                <Share2 size={20} />
              </button>
            </div>

            {/* Benefits */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-3">
                <Truck className="text-primary" size={20} />
                <span>Giao hàng miễn phí toàn TP.HCM</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-primary" size={20} />
                <span>Bảo hành chính hãng 12 tháng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specifications.map((spec, index) => {
                // Handle both string format "Label: Value" and object format {label, value}
                let label, value;
                if (typeof spec === 'string') {
                  const parts = spec.split(':');
                  label = parts[0]?.trim() || '';
                  value = parts.slice(1).join(':').trim() || spec;
                } else if (typeof spec === 'object' && spec !== null) {
                  label = spec.label || spec.key || '';
                  value = spec.value || '';
                } else {
                  return null;
                }
                
                return (
                  <div key={index} className="flex gap-4 pb-4 border-b">
                    <span className="font-semibold text-dark w-32 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
