import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';

const ProductModal = ({ 
  isOpen, 
  isEditing, 
  formData, 
  categories, 
  onFormChange, 
  onSave, 
  onCancel, 
  errors, 
  isLoading 
}) => {
  const [specs, setSpecs] = useState([]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    if (isOpen && formData.specifications) {
      // Handle both old string format and new object format
      const processedSpecs = formData.specifications.map(spec => {
        if (typeof spec === 'string') {
          const parts = spec.split(':');
          return { name: parts[0]?.trim() || '', value: parts.slice(1).join(':').trim() || spec };
        }
        return spec;
      });
      setSpecs(processedSpecs);
    }
  }, [isOpen, formData.specifications]);

  const handleAddSpec = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      const updated = [...specs, { name: newSpecName.trim(), value: newSpecValue.trim() }];
      setSpecs(updated);
      onFormChange('specifications', updated);
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpec = (index) => {
    const updated = specs.filter((_, i) => i !== index);
    setSpecs(updated);
    onFormChange('specifications', updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.category
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price *
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => onFormChange('originalPrice', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.originalPrice
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
                step="0.01"
              />
              {errors.originalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => onFormChange('price', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
                step="0.01"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Discount & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => onFormChange('discount', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => onFormChange('stock', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
            </label>
            <ImageUpload
              onImageUrlChange={(url) => onFormChange('image', url)}
              initialImageUrl={formData.image}
              disabled={isLoading}
            />
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter product description"
              rows="4"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thông số kỹ thuật (Specifications)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              <input
                type="text"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                disabled={isLoading}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Tên (VD: Màn hình)"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
                disabled={isLoading}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Giá trị (VD: 6.7 inch AMOLED)"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                disabled={isLoading || !newSpecName.trim() || !newSpecValue.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Quick add common specs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {['Màn hình', 'Chip/CPU', 'RAM', 'Bộ nhớ', 'Camera sau', 'Camera trước', 'Pin', 'Hệ điều hành'].map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewSpecName(name)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {name}
                </button>
              ))}
            </div>

            {specs.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Thông số</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Giá trị</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {specs.map((spec, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{spec.name}</td>
                        <td className="px-3 py-2 text-gray-600">{spec.value}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(index)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              isEditing ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
