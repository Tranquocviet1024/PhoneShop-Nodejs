import React from 'react';
import { Users, Target, Heart, Shield, Zap, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Chúng Tôi</h1>
          <p className="text-xl opacity-90">
            Chúng tôi là nhà cung cấp điện thoại di động chính hãng hàng đầu tại TP.HCM
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-dark">Sứ Mệnh Của Chúng Tôi</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Với hơn 10 năm kinh nghiệm trong ngành bán lẻ điện thoại di động, chúng tôi cam kết cung cấp những sản phẩm chính hãng chất lượng cao với giá cả cạnh tranh nhất.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Mục tiêu của chúng tôi là mang đến cho khách hàng những chiếc điện thoại tốt nhất với dịch vụ hỗ trợ tuyệt vời.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi luôn lắng nghe và cải thiện để phục vụ khách hàng một cách tốt nhất.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Target className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-dark mb-2">Tầm Nhìn</h3>
                  <p className="text-gray-600">Trở thành cửa hàng điện thoại uy tín số 1 tại TP.HCM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Heart className="text-accent flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-dark mb-2">Giá Trị</h3>
                  <p className="text-gray-600">Chất lượng, uy tín, sự hài lòng của khách hàng</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Zap className="text-secondary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-dark mb-2">Cam Kết</h3>
                  <p className="text-gray-600">100% sản phẩm chính hãng, bảo hành đầy đủ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-dark">Tại Sao Chọn Chúng Tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-light rounded-lg p-8 text-center">
              <Shield className="text-primary mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Sản Phẩm Chính Hãng</h3>
              <p className="text-gray-600">
                100% các sản phẩm được nhập khẩu chính thức từ các hãng điện thoại lớn
              </p>
            </div>

            <div className="bg-light rounded-lg p-8 text-center">
              <Users className="text-secondary mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Hỗ Trợ Tuyệt Vời</h3>
              <p className="text-gray-600">
                Đội ngũ nhân viên chuyên nghiệp sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>

            <div className="bg-light rounded-lg p-8 text-center">
              <Heart className="text-accent mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Bảo Hành Chính Hãng</h3>
              <p className="text-gray-600">
                Tất cả sản phẩm đều có bảo hành chính hãng 12 tháng
              </p>
            </div>

            <div className="bg-light rounded-lg p-8 text-center">
              <Globe className="text-primary mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Giá Cạnh Tranh</h3>
              <p className="text-gray-600">
                Giá bán tốt nhất trên thị trường với chất lượng đảm bảo
              </p>
            </div>

            <div className="bg-light rounded-lg p-8 text-center">
              <Zap className="text-secondary mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Giao Hàng Nhanh</h3>
              <p className="text-gray-600">
                Giao hàng miễn phí trong vòng 24 giờ tại TP.HCM
              </p>
            </div>

            <div className="bg-light rounded-lg p-8 text-center">
              <Heart className="text-accent mx-auto mb-4" size={40} />
              <h3 className="font-bold text-lg mb-3 text-dark">Hài Lòng Khách Hàng</h3>
              <p className="text-gray-600">
                Hơn 10,000+ khách hàng hài lòng đã mua hàng tại chúng tôi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-xl mb-8 opacity-90">
            Có bất kỳ câu hỏi nào? Hãy liên hệ với chúng tôi ngay hôm nay!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-bold mb-2">Địa Chỉ</p>
              <p className="opacity-90">123 Đường Nguyễn Hữu Cảnh, TP.HCM</p>
            </div>
            <div>
              <p className="font-bold mb-2">Điện Thoại</p>
              <p className="opacity-90">0912 345 678</p>
            </div>
            <div>
              <p className="font-bold mb-2">Email</p>
              <p className="opacity-90">support@testdb.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
