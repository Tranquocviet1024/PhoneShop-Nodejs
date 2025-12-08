import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, X } from 'lucide-react';
import RecentlyViewedService from '../services/RecentlyViewedService';
import { useAuth } from '../context/AuthContext';

const RecentlyViewed = ({ limit = 6, showTitle = true }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    } else {
      // Load from localStorage for non-logged in users
      const localViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setProducts(localViewed.slice(0, limit));
      setLoading(false);
    }
  }, [user, limit]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const response = await RecentlyViewedService.getRecentlyViewed(limit);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    if (user) {
      try {
        await RecentlyViewedService.removeFromRecentlyViewed(productId);
        setProducts(products.filter(p => (p.product?.id || p.productId) !== productId));
      } catch (error) {
        console.error('Error removing product:', error);
      }
    } else {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
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
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Sản phẩm đã xem gần đây</h2>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((item) => {
          const product = item.product || item;
          return (
            <div
              key={item.id || product.id}
              className="group relative bg-gray-50 rounded-lg p-3 hover:shadow-md transition"
            >
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition z-10"
              >
                <X size={14} className="text-gray-500" />
              </button>
              
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="text-sm font-medium line-clamp-2 hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="text-red-600 font-bold text-sm mt-1">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to track viewed products
export const trackProductView = async (product, user) => {
  if (user) {
    try {
      await RecentlyViewedService.addToRecentlyViewed(product.id);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  } else {
    // Store in localStorage for non-logged in users
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

export default RecentlyViewed;
