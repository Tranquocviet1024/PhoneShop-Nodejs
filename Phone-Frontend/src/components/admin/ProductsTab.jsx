import React from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

const ProductsTab = ({ 
  products, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button 
          onClick={onAddClick}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Thêm Sản Phẩm
        </button>
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-dark">Sản Phẩm</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Danh Mục</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Giá</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Tồn Kho</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6 font-semibold">{product.name}</td>
                  <td className="py-3 px-6">{product.category}</td>
                  <td className="py-3 px-6 font-semibold text-primary">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(parseFloat(product.price) || 0)}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      product.stock > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-6 flex gap-2">
                    <button 
                      onClick={() => onEditClick(product)}
                      className="text-primary hover:text-accent transition p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteClick(product.id)}
                      className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Không có sản phẩm</p>
          <p className="text-gray-500 text-sm mt-1">Cần kết nối API: GET /admin/products</p>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
