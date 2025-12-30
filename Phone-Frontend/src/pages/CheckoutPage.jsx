import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, CheckCircle, AlertCircle, Tag, X } from 'lucide-react';
import OrderService from '../services/OrderService';
import CouponService from '../services/CouponService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  if (cart.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-screen bg-light">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>
    );
  }

  const totalPrice = getTotalPrice();
  const shippingCost = 0;
  const tax = Math.round(totalPrice * 0.08);
  const finalTotal = totalPrice + shippingCost + tax - discountAmount;

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await CouponService.validateCoupon(couponCode, totalPrice, cart);
      
      if (response.success && response.data) {
        setAppliedCoupon(response.data.coupon);
        setDiscountAmount(response.data.discountAmount || 0);
        setCouponCode('');
      } else {
        setCouponError(response.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      setCouponError(err.message || 'Không thể áp dụng mã giảm giá');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingData.fullName || !shippingData.email || !shippingData.phone || 
        !shippingData.address || !shippingData.ward || !shippingData.district || !shippingData.city) {
      setError('Vui lòng nhập đầy đủ thông tin giao hàng!');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Build request body theo format API yêu cầu
      const products = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const orderData = {
        products,
        shippingAddress: {
          fullName: shippingData.fullName,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.address,
          ward: shippingData.ward,
          district: shippingData.district,
          city: shippingData.city,
        },
        paymentMethod,
        totalAmount: totalPrice, // Giá sản phẩm (không bao gồm tax + shipping)
        shippingCost: shippingCost,
        tax: tax,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount,
      };

      console.log('📦 Sending order:', orderData);

      // Call API tạo đơn hàng
      const response = await OrderService.createOrder(orderData);

      if (response.success && response.data) {
        const createdOrder = response.data;
        clearCart();

        if (paymentMethod === 'e-wallet') {
          navigate('/payment/payos', {
            state: {
              orderId: createdOrder.orderId,
              totalAmount: createdOrder.finalTotal,
            },
          });
          return;
        }

        setOrderId(createdOrder.orderId);
        setOrderPlaced(true);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (err) {
      console.error('❌ Error placing order:', err);
      
      // Handle error response từ API
      if (err.message) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-light flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã mua sắm tại PhoneShop.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Mã đơn hàng</p>
            <p className="text-lg font-bold text-primary">{orderId}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Chúng tôi sẽ gửi email xác nhận và chi tiết giao hàng đến{' '}
            <span className="font-bold">{shippingData.email}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-accent transition mb-8"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-lg transition ${
                    s <= step ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">
                  1️⃣ Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Họ và tên"
                    value={shippingData.fullName}
                    onChange={handleShippingChange}
                    className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingData.email}
                    onChange={handleShippingChange}
                    className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={shippingData.phone}
                    onChange={handleShippingChange}
                    required
                    className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ chi tiết"
                    value={shippingData.address}
                    onChange={handleShippingChange}
                    required
                    className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="ward"
                    placeholder="Phường/Xã"
                    value={shippingData.ward}
                    onChange={handleShippingChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    name="district"
                    placeholder="Quận/Huyện"
                    value={shippingData.district}
                    onChange={handleShippingChange}
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <select
                    name="city"
                    value={shippingData.city}
                    onChange={handleShippingChange}
                    required
                    className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Hải Phòng</option>
                    <option>Cần Thơ</option>
                    <option>An Giang</option>
                    <option>Bà Rịa - Vũng Tàu</option>
                    <option>Bạc Liêu</option>
                    <option>Bắc Giang</option>
                    <option>Bắc Kạn</option>
                    <option>Bắc Ninh</option>
                    <option>Bến Tre</option>
                    <option>Bình Dương</option>
                    <option>Bình Phước</option>
                    <option>Bình Thuận</option>
                    <option>Cà Mau</option>
                    <option>Cao Bằng</option>
                    <option>Đắk Lắk</option>
                    <option>Đắk Nông</option>
                    <option>Điện Biên</option>
                    <option>Đồng Nai</option>
                    <option>Đồng Tháp</option>
                    <option>Gia Lai</option>
                    <option>Hà Giang</option>
                    <option>Hà Nam</option>
                    <option>Hà Tĩnh</option>
                    <option>Hải Dương</option>
                    <option>Hạ Long</option>
                    <option>Hoà Bình</option>
                    <option>Hưng Yên</option>
                    <option>Khánh Hòa</option>
                    <option>Kiên Giang</option>
                    <option>Kon Tum</option>
                    <option>Lai Châu</option>
                    <option>Lâm Đồng</option>
                    <option>Lạng Sơn</option>
                    <option>Lào Cai</option>
                    <option>Long An</option>
                    <option>Nam Định</option>
                    <option>Nghệ An</option>
                    <option>Ninh Bình</option>
                    <option>Ninh Thuận</option>
                    <option>Phú Thọ</option>
                    <option>Quảng Bình</option>
                    <option>Quảng Nam</option>
                    <option>Quảng Ngãi</option>
                    <option>Quảng Ninh</option>
                    <option>Quảng Trị</option>
                    <option>Sóc Trăng</option>
                    <option>Sơn La</option>
                    <option>Tây Ninh</option>
                    <option>Thái Bình</option>
                    <option>Thái Nguyên</option>
                    <option>Thanh Hóa</option>
                    <option>Thừa Thiên Huế</option>
                    <option>Tiền Giang</option>
                    <option>Trà Vinh</option>
                    <option>Tuyên Quang</option>
                    <option>Vĩnh Long</option>
                    <option>Vĩnh Phúc</option>
                    <option>Yên Bái</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition"
                >
                  Tiếp tục: Thanh toán
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">2️⃣ Phương thức thanh toán</h2>

                <div className="space-y-4 mb-6">
                  {[
                    { id: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)' },
                    { id: 'e-wallet', label: '📱 Thanh toán online (PayOS - QR Code)' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition"
                      style={{
                        borderColor:
                          paymentMethod === method.id ? '#FF8C00' : '#E5E7EB',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold">{method.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition"
                  >
                    Kiểm tra đơn hàng
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">3️⃣ Kiểm tra đơn hàng</h2>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    ✅ Giao hàng đến: <span className="font-bold">{shippingData.fullName}</span>
                  </p>
                  <p className="text-sm text-blue-800">
                    📍 {shippingData.address}, {shippingData.ward}, {shippingData.district}
                  </p>
                  <p className="text-sm text-blue-800">
                    💳 Thanh toán: 
                    {paymentMethod === 'cod' && ' Thanh toán khi nhận hàng (COD)'}
                    {paymentMethod === 'e-wallet' && ' Thanh toán online (PayOS - QR Code)'}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Đang xử lý...' : '✅ Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Input */}
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Mã giảm giá
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        Giảm {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(discountAmount)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition disabled:opacity-50 text-sm font-medium"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vận chuyển:</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế (8%):</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(tax)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>
                      -{new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(discountAmount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-4">
                <span className="font-bold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
