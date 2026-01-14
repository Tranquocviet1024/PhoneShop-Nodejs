import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { logout, isAuthenticated } = useAuth();
  const cartCount = getTotalItems();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.jpg" 
              alt="PhoneShop Logo" 
              className="w-10 h-10 rounded-lg object-contain"
            />
            <span className="text-2xl font-bold text-dark hidden sm:inline">PhoneShop</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-dark hover:text-primary transition">
              Trang chủ
            </Link>
            <Link to="/products" className="text-dark hover:text-primary transition">
              Sản phẩm
            </Link>
            <Link to="/categories" className="text-dark hover:text-primary transition">
              Danh mục
            </Link>
            <Link to="/about" className="text-dark hover:text-primary transition">
              Về chúng tôi
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-dark hover:text-primary transition">
                Đơn hàng
              </Link>
            )}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="relative hover:text-primary transition" title="Yêu thích">
                <Heart size={24} className="text-dark" />
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <NotificationDropdown />
            )}

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-primary transition">
              <ShoppingCart size={24} className="text-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-dark hover:text-primary transition">
                  <User size={24} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-dark hover:text-primary transition"
                >
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition">
                Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 border-t pt-4 flex flex-col gap-3">
            <Link to="/" className="text-dark hover:text-primary transition">
              Trang chủ
            </Link>
            <Link to="/products" className="text-dark hover:text-primary transition">
              Sản phẩm
            </Link>
            <Link to="/categories" className="text-dark hover:text-primary transition">
              Danh mục
            </Link>
            <Link to="/about" className="text-dark hover:text-primary transition">
              Về chúng tôi
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-dark hover:text-primary transition">
                Đơn hàng
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/wishlist" className="text-dark hover:text-primary transition">
                Yêu thích
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-left text-dark hover:text-primary transition"
              >
                Đăng xuất
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
