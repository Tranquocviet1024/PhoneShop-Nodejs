import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Truck, Shield, Clock, Scale } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FlashSaleBanner from '../components/FlashSaleBanner';
import RecentlyViewed from '../components/RecentlyViewed';
import api from '../api/axiosConfig';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      // Backend trả về: { data: { products: [...], pagination: {...} }, ... }
      let data = response.data;
      if (!Array.isArray(data)) {
        data = data?.data?.products || data?.data || data?.products || [];
      }
      if (Array.isArray(data)) {
        setProducts(data.slice(0, 8)); // Hiển thị 8 sản phẩm đầu tiên
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🎉 Điện thoại chính hãng giá rẻ
            </h1>
            <p className="text-lg mb-8 opacity-90">
              Khám phá bộ sưu tập điện thoại thông minh mới nhất từ các thương hiệu hàng đầu thế giới. Giá tốt, chất lượng đảm bảo.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-light transition"
            >
              Mua ngay <ChevronRight size={20} />
            </Link>
          </div>
          <div className="md:w-1/2 text-center">
            <img 
              src="/logo.jpg" 
              alt="PhoneShop Logo" 
              className="w-64 h-64 mx-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Zap className="text-primary" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Hàng chính hãng</h3>
            <p className="text-gray-600">100% sản phẩm gốc, đảm bảo chất lượng</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Truck className="text-primary" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Giao hàng nhanh</h3>
            <p className="text-gray-600">Miễn phí giao hàng toàn TP.HCM</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Shield className="text-primary" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">An toàn & bảo mật</h3>
            <p className="text-gray-600">Thanh toán an toàn, bảo vệ dữ liệu</p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Clock className="text-primary" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
            <p className="text-gray-600">Tư vấn & hỗ trợ mọi lúc mọi nơi</p>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <FlashSaleBanner />
      </section>

      {/* Compare Link */}
      <section className="max-w-7xl mx-auto px-4">
        <Link
          to="/compare"
          className="flex items-center justify-center gap-3 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition"
        >
          <Scale className="text-blue-600" size={24} />
          <span className="font-semibold text-blue-700">So sánh sản phẩm - Chọn điện thoại phù hợp nhất</span>
          <ChevronRight className="text-blue-600" size={20} />
        </Link>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-dark">Sản phẩm nổi bật</h2>
          <Link
            to="/products"
            className="text-primary hover:text-accent font-bold flex items-center gap-1"
          >
            Xem tất cả <ChevronRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white py-16 px-4 my-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận khuyến mại</h2>
          <p className="text-gray-300 mb-8">
            Nhận thông báo về các sản phẩm mới và ưu đãi độc quyền
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-dark"
            />
            <button className="bg-primary hover:bg-accent px-8 py-3 rounded-lg font-bold transition">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <RecentlyViewed />
      </section>
    </main>
  );
};

export default HomePage;
