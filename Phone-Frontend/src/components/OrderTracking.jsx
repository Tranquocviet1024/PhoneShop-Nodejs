import React, { useState, useEffect } from 'react';
import OrderTrackingService from '../services/OrderTrackingService';

const OrderTracking = ({ orderId }) => {
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await OrderTrackingService.getOrderTracking(orderId);
      // API returns { data: { order, currentStatus, timeline, estimatedDelivery } }
      const trackingData = response.data?.timeline || [];
      setTracking(trackingData);
      
      // Get current status from response
      if (response.data?.currentStatus) {
        setCurrentStatus(response.data.currentStatus);
      } else if (trackingData.length > 0) {
        setCurrentStatus(trackingData[trackingData.length - 1].status);
      }
    } catch (err) {
      setError('Không thể tải thông tin theo dõi đơn hàng');
      console.error('Error fetching tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  const progress = OrderTrackingService.getProgressPercentage(currentStatus);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📦 Theo dõi đơn hàng #{orderId}
      </h3>

      {/* Progress Bar */}
      {currentStatus && !['cancelled', 'returned'].includes(currentStatus) && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ giao hàng</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Current Status Badge */}
      {currentStatus && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border-l-4" 
          style={{ borderColor: OrderTrackingService.getStatusInfo(currentStatus).color }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {OrderTrackingService.getStatusInfo(currentStatus).icon}
            </span>
            <div>
              <p className="font-semibold text-gray-800">
                {OrderTrackingService.getStatusInfo(currentStatus).label}
              </p>
              <p className="text-sm text-gray-600">
                {OrderTrackingService.getStatusInfo(currentStatus).description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {tracking.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          Chưa có thông tin theo dõi
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {tracking.map((event, index) => {
              const statusInfo = OrderTrackingService.getStatusInfo(event.status);
              const isFirst = index === 0;

              return (
                <div key={event.id} className="relative flex items-start gap-4 ml-0">
                  {/* Circle Indicator */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isFirst
                        ? 'bg-white border-blue-500'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                    style={isFirst ? { borderColor: statusInfo.color } : {}}
                  >
                    <span className={isFirst ? 'text-sm' : 'text-xs'}>
                      {statusInfo.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-2 ${isFirst ? '' : 'opacity-70'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${isFirst ? 'text-gray-800' : 'text-gray-600'}`}>
                        {statusInfo.label}
                      </p>
                      <span className="text-xs text-gray-400">
                        {OrderTrackingService.formatTrackingDate(event.createdAt)}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}

                    {/* Metadata display */}
                    {event.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {event.metadata.carrier && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                            Đơn vị: {event.metadata.carrier}
                          </span>
                        )}
                        {event.metadata.trackingNumber && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                            Mã vận đơn: {event.metadata.trackingNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
