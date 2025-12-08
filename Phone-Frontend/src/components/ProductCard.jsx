import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
        {typeof product.image === 'string' && product.image.match(/^https?:/) ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
        ) : null}
        <div className="text-6xl text-center">
          {typeof product.image === 'string' && !product.image.match(/^https?:/)
            ? product.image
            : '📱'}
        </div>
        {product.discount && (
          <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        <WishlistButton 
          productId={product.id} 
          className="absolute top-3 left-3"
          size="sm"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-primary font-semibold uppercase mb-2">
          {product.category || 'Điện thoại'}
        </p>

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-dark hover:text-primary transition line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 my-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price || 0)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <p className="text-xs mb-4">
          {product.stock > 0 ? (
            <span className="text-green-600 font-semibold">Có sẵn ({product.stock})</span>
          ) : (
            <span className="text-red-600 font-semibold">Hết hàng</span>
          )}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Thêm vào giỏi
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
