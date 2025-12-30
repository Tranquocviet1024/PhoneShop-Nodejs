import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import FlashSaleService from '../services/FlashSaleService';
import { getImageUrl } from '../utils/imageUtils';

const FlashSaleBanner = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateCountdowns();
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashSales]);

  const fetchFlashSales = async () => {
    try {
      const response = await FlashSaleService.getActiveFlashSales();
      setFlashSales(response.data || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdowns = () => {
    const newTimeLeft = {};
    flashSales.forEach(sale => {
      const endTime = new Date(sale.endTime).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff > 0) {
        newTimeLeft[sale.id] = {
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
      } else {
        newTimeLeft[sale.id] = null;
      }
    });
    setTimeLeft(newTimeLeft);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading || flashSales.length === 0) {
    return null;
  }

  const activeSale = flashSales[0];
  const countdown = timeLeft[activeSale?.id];

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-full animate-pulse">
            <Zap className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">⚡ FLASH SALE</h2>
            <p className="text-yellow-200 text-sm">{activeSale?.name}</p>
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="flex items-center gap-2">
            <Clock className="text-white" size={20} />
            <span className="text-white text-sm">Kết thúc sau:</span>
            <div className="flex gap-1">
              <div className="bg-white text-red-600 font-bold px-2 py-1 rounded">
                {String(countdown.hours).padStart(2, '0')}
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white text-red-600 font-bold px-2 py-1 rounded">
                {String(countdown.minutes).padStart(2, '0')}
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white text-red-600 font-bold px-2 py-1 rounded">
                {String(countdown.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        <Link
          to={`/flash-sale/${activeSale?.id}`}
          className="flex items-center gap-1 bg-yellow-400 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition"
        >
          Xem tất cả
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* Products */}
      <div className="bg-white px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activeSale?.items?.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.product?.id || item.productId}`}
              className="group"
            >
              <div className="relative bg-gray-50 rounded-lg p-3 hover:shadow-md transition">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  -{item.discountPercent}%
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(item.soldCount / item.stockLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Đã bán {item.soldCount}/{item.stockLimit}
                  </p>
                </div>

                <img
                  src={getImageUrl(item.product?.image)}
                  alt={item.product?.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />

                <h3 className="text-sm font-medium line-clamp-2 mb-8 group-hover:text-red-600">
                  {item.product?.name}
                </h3>

                <div className="absolute bottom-16 left-3 right-3">
                  <p className="text-red-600 font-bold">{formatPrice(item.salePrice)}</p>
                  <p className="text-gray-400 line-through text-xs">
                    {formatPrice(item.originalPrice)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
