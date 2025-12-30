import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUtils';

const ProductTable = ({ products, onEditClick, onDeleteClick, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{product.id}</td>
              <td className="px-6 py-4 text-sm">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="h-10 w-10 object-cover rounded bg-gray-100"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect fill="%23e5e7eb" width="40" height="40"/%3E%3Ctext x="20" y="20" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%239ca3af"%3ENo Img%3C/text%3E%3C/svg%3E';
                  }}
                />
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div>
                  <div className="font-medium">${product.price}</div>
                  {product.discount > 0 && (
                    <div className="text-xs text-red-600">-{product.discount}%</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock} units
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEditClick(product)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteClick(product)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
