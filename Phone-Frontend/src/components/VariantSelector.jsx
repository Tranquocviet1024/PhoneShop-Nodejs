import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import VariantService from '../services/VariantService';

const VariantSelector = ({ productId, onVariantChange, initialVariant = null }) => {
  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState({ colors: [], storages: [] });
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  useEffect(() => {
    if (selectedColor || selectedStorage) {
      findVariant();
    }
  }, [selectedColor, selectedStorage]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await VariantService.getProductVariants(productId);
      const data = response.data;
      
      setVariants(data.variants || []);
      setOptions(data.options || { colors: [], storages: [] });

      // Set initial selections
      if (data.variants?.length > 0) {
        const firstVariant = data.variants[0];
        setSelectedColor(firstVariant.color);
        setSelectedStorage(firstVariant.storage);
        setSelectedVariant(firstVariant);
        onVariantChange?.(firstVariant);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const findVariant = async () => {
    try {
      const response = await VariantService.getVariantByOptions(
        productId,
        selectedColor,
        selectedStorage
      );
      setSelectedVariant(response.data);
      onVariantChange?.(response.data);
    } catch (error) {
      // Variant not found for this combination
      setSelectedVariant(null);
      onVariantChange?.(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Color Selection */}
      {options.colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc: <span className="font-normal">{selectedColor}</span>
          </label>
          <div className="flex gap-3">
            {options.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`relative w-10 h-10 rounded-full border-2 transition ${
                  selectedColor === color.name
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.code || '#ccc' }}
                title={color.name}
              >
                {selectedColor === color.name && (
                  <Check
                    size={16}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                      color.code && isLightColor(color.code) ? 'text-gray-800' : 'text-white'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Storage Selection */}
      {options.storages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dung lượng
          </label>
          <div className="flex flex-wrap gap-2">
            {options.storages.map((storage) => (
              <button
                key={storage}
                onClick={() => setSelectedStorage(storage)}
                className={`px-4 py-2 border rounded-lg transition ${
                  selectedStorage === storage
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">SKU: {selectedVariant.sku}</p>
              <p className="text-sm text-gray-600">
                Tồn kho: 
                <span className={selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {selectedVariant.stock > 0 ? ` ${selectedVariant.stock} sản phẩm` : ' Hết hàng'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-600">
                {formatPrice(selectedVariant.price)}
              </p>
              {selectedVariant.originalPrice > selectedVariant.price && (
                <p className="text-sm text-gray-400 line-through">
                  {formatPrice(selectedVariant.originalPrice)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedVariant && selectedColor && selectedStorage && (
        <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700">
          Không có sản phẩm với phiên bản này
        </div>
      )}
    </div>
  );
};

// Helper function to determine if a color is light
function isLightColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export default VariantSelector;
