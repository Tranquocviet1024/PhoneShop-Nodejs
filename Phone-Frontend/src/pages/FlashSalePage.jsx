import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, Clock, ShoppingCart } from 'lucide-react';
import FlashSaleService from '../services/FlashSaleService';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const FlashSalePage = () => {
  const { id } = useParams();
  const [flashSale, setFlashSale] = useState(null);
  const [flashSales, setFlashSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchFlashSaleDetail();
    } else {
      fetchAllFlashSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (flashSale) {
        updateCountdown(flashSale.endTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  const fetchFlashSaleDetail = async () => {
    try {
      const response = await FlashSaleService.getFlashSaleById(id);
      setFlashSale(response.data);
      updateCountdown(response.data.endTime);
    } catch (error) {
      console.error('Error fetching flash sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFlashSales = async () => {
    try {
      const response = await FlashSaleService.getActiveFlashSales();
      setFlashSales(response.data || []);
      if (response.data?.length > 0) {
        setFlashSale(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = (endTime) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff > 0) {
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    } else {
      setTimeLeft(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.product?.id || item.productId,
      name: item.product?.name,
      price: item.salePrice,
      image: item.product?.image,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!flashSale) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <Zap className="text-gray-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-600 mb-2">
          Không có Flash Sale nào đang diễn ra
        </h1>
        <p className="text-gray-500 mb-4">
          Hãy quay lại sau để không bỏ lỡ các ưu đãi hấp dẫn
        </p>
        <Link
          to="/products"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="hover:underline">Trang chủ</Link>
            <span>/</span>
            <span>Flash Sale</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-yellow-400 p-3 rounded-full animate-pulse">
                <Zap className="text-red-600" size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">⚡ FLASH SALE</h1>
                <p className="text-yellow-200">{flashSale.name}</p>
              </div>
            </div>

            {/* Countdown */}
            {timeLeft ? (
              <div className="text-center">
                <p className="text-yellow-200 mb-2 flex items-center gap-2">
                  <Clock size={20} />
                  Kết thúc sau
                </p>
                <div className="flex gap-2">
                  <div className="bg-white text-red-600 font-bold text-2xl px-4 py-2 rounded-lg">
                    {String(timeLeft.hours).padStart(2, '0')}
                    <span className="text-xs block">Giờ</span>
                  </div>
                  <div className="text-4xl font-bold">:</div>
                  <div className="bg-white text-red-600 font-bold text-2xl px-4 py-2 rounded-lg">
                    {String(timeLeft.minutes).padStart(2, '0')}
                    <span className="text-xs block">Phút</span>
                  </div>
                  <div className="text-4xl font-bold">:</div>
                  <div className="bg-white text-red-600 font-bold text-2xl px-4 py-2 rounded-lg">
                    {String(timeLeft.seconds).padStart(2, '0')}
                    <span className="text-xs block">Giây</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold">
                Đã kết thúc
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {flashSale.items?.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition"
            >
              {/* Discount Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                  -{item.discountPercent}%
                </div>
                <Link to={`/products/${item.product?.id || item.productId}`}>
                  <img
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.name}
                    className="w-full h-48 object-contain p-4 group-hover:scale-105 transition"
                  />
                </Link>
              </div>

              <div className="p-4">
                <Link to={`/products/${item.product?.id || item.productId}`}>
                  <h3 className="font-medium line-clamp-2 mb-2 hover:text-blue-600 min-h-[48px]">
                    {item.product?.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-red-600 font-bold text-lg">
                    {formatPrice(item.salePrice)}
                  </p>
                  <p className="text-gray-400 line-through text-sm">
                    {formatPrice(item.originalPrice)}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="bg-red-100 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                      style={{ width: `${Math.min((item.soldCount / item.stockLimit) * 100, 100)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-medium drop-shadow">
                        {item.soldCount >= item.stockLimit ? 'Đã bán hết' : `Đã bán ${item.soldCount}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Còn lại {Math.max(item.stockLimit - item.soldCount, 0)} sản phẩm
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.soldCount >= item.stockLimit || !timeLeft}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                    item.soldCount >= item.stockLimit || !timeLeft
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {item.soldCount >= item.stockLimit ? 'Hết hàng' : 'Mua ngay'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!flashSale.items || flashSale.items.length === 0) && (
          <div className="text-center py-12">
            <Zap className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500">Không có sản phẩm trong Flash Sale này</p>
          </div>
        )}
      </div>

      {/* Other Flash Sales */}
      {flashSales.length > 1 && (
        <div className="container mx-auto px-4 pb-8">
          <h2 className="text-xl font-bold mb-4">Flash Sale khác</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashSales
              .filter(sale => sale.id !== flashSale.id)
              .map((sale) => (
                <Link
                  key={sale.id}
                  to={`/flash-sale/${sale.id}`}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="text-red-500" size={24} />
                    <div>
                      <h3 className="font-semibold">{sale.name}</h3>
                      <p className="text-sm text-gray-500">
                        {sale.items?.length || 0} sản phẩm
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSalePage;
