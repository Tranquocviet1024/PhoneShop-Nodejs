import React from 'react';

const ProductModal = ({ 
  isOpen, 
  isEditing,
  formData, 
  onFormChange, 
  onSave, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <textarea
            placeholder="Mô tả"
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            rows="2"
          />
          <input
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={(e) => onFormChange({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="number"
            placeholder="Tồn kho"
            value={formData.stock}
            onChange={(e) => onFormChange({ ...formData, stock: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <select
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Chọn danh mục</option>
            <option value="iPhone">iPhone</option>
            <option value="Samsung">Samsung</option>
            <option value="Oppo">Oppo</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="Vivo">Vivo</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSave}
            className="flex-1 bg-primary text-white py-2 rounded hover:bg-accent transition text-sm"
          >
            Lưu
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
