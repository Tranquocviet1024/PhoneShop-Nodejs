import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCart();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-light">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button className="flex items-center gap-2 text-primary hover:text-accent transition mb-8">
            <ChevronLeft size={20} />
            <Link to="/products">Tiếp tục mua hàng</Link>
          </button>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h1 className="text-3xl font-bold text-dark mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Chưa có sản phẩm nào trong giỏ hàng của bạn.
            </p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalPrice = getTotalPrice();
  const shippingCost = 0; // Miễn phí vận chuyển
  const tax = Math.round(totalPrice * 0.08); // 8% thuế
  const finalTotal = totalPrice + shippingCost + tax;

  return (
    <main className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b font-bold">
                <div className="col-span-1">Ảnh</div>
                <div className="col-span-4">Sản phẩm</div>
                <div className="col-span-2">Giá</div>
                <div className="col-span-2">Số lượng</div>
                <div className="col-span-2">Tổng</div>
                <div className="col-span-1">Xóa</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    {/* Image */}
                    <div className="md:col-span-1">
                      <img
                        src={getImageUrl(item.image) || 'https://via.placeholder.com/80?text=Product'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-4">
                      <h3 className="font-bold text-dark mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {item.id}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2">
                      <p className="font-semibold text-primary">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.price)}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="px-3 py-1 text-primary"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const maxStock = item.stock || 999;
                              if (item.quantity < maxStock) {
                                updateQuantity(item.id, item.quantity + 1);
                              }
                            }}
                            className="px-3 py-1 text-primary hover:text-accent disabled:text-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {item.stock && item.quantity >= item.stock && (
                          <p className="text-xs text-red-500 font-semibold">
                            Đã đạt số lượng tối đa ({item.stock})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2">
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Delete */}
                    <div className="md:col-span-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="p-6 border-t">
                <button
                  onClick={clearCart}
                  className="text-red-500 font-semibold hover:text-red-700 transition"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (8%):</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(tax)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(finalTotal)}
                </span>
              </div>

              <Link
                to="/checkout"
                className="w-full block text-center bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition mb-3"
              >
                Tiếp tục thanh toán
              </Link>

              <Link
                to="/products"
                className="w-full block text-center border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition"
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
