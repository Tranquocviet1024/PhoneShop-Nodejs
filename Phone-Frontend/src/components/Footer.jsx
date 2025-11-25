import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📱</span>
              </div>
              <h3 className="text-xl font-bold">PhoneShop</h3>
            </div>
            <p className="text-gray-400">Cửa hàng điện thoại uy tín hàng đầu Việt Nam</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-primary transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-4">Dịch vụ khách hàng</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-primary transition text-left"
                >
                  Chính sách đổi trả
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-primary transition text-left"
                >
                  Hướng dẫn mua hàng
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-primary transition text-left"
                >
                  Câu hỏi thường gặp
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={20} className="text-primary" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={20} className="text-primary" />
                <span>info@phoneshop.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={20} className="text-primary" />
                <span>123 Đường Lê Lợi, HCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex gap-4 mb-4 md:mb-0">
            <button
              onClick={() => window.open('https://facebook.com', '_blank')}
              className="bg-primary p-3 rounded-lg hover:bg-accent transition"
            >
              <Facebook size={20} />
            </button>
            <button
              onClick={() => window.open('https://instagram.com', '_blank')}
              className="bg-primary p-3 rounded-lg hover:bg-accent transition"
            >
              <Instagram size={20} />
            </button>
            <button
              onClick={() => window.open('https://twitter.com', '_blank')}
              className="bg-primary p-3 rounded-lg hover:bg-accent transition"
            >
              <Twitter size={20} />
            </button>
          </div>
          <p className="text-gray-400 text-center md:text-right">
            © 2024 PhoneShop. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
