import React, { useState, useEffect } from 'react';
import WishlistService from '../services/WishlistService';
import { useAuth } from '../context/AuthContext';

const WishlistButton = ({ productId, className = '', size = 'md' }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await WishlistService.checkWishlist(productId);
      setInWishlist(response.data?.inWishlist || false);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show message
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await WishlistService.removeFromWishlist(productId);
        setInWishlist(false);
      } else {
        await WishlistService.addToWishlist(productId);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-white
        shadow-md
        hover:shadow-lg
        transition-all
        duration-200
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
        ${className}
      `}
      title={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      {loading ? (
        <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          className={iconSizes[size]}
          fill={inWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default WishlistButton;
