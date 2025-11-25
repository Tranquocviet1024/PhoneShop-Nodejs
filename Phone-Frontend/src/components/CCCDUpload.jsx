import React, { useState } from 'react';
import { Upload, Camera, X, Loader } from 'lucide-react';
import OCRService from '../services/OCRService';

const CCCDUpload = ({ onDataExtracted, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setError('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh CCCD');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await OCRService.extractCCCD(selectedFile);
      
      if (response.success && response.data) {
        setExtractedData(response.data);
        
        // Auto-fill form with extracted data
        if (onDataExtracted) {
          onDataExtracted(response.data);
        }
      } else {
        setError('Không thể trích xuất thông tin từ ảnh. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      const message = err.response?.data?.error?.message || 
                     'Không thể xử lý ảnh CCCD. Vui lòng đảm bảo ảnh rõ ràng và chứa thông tin CCCD hợp lệ.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedData(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Camera className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">Quét CCCD tự động</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📸 Chụp hoặc tải lên ảnh CCCD rõ ràng để hệ thống tự động điền thông tin
            </p>
          </div>

          {/* Upload Area */}
          {!preview ? (
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition">
                <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Chọn ảnh CCCD
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: JPG, JPEG, PNG (tối đa 5MB)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative">
                <img
                  src={preview}
                  alt="CCCD Preview"
                  className="w-full rounded-lg border"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Extract Button */}
              {!extractedData && (
                <button
                  onClick={handleExtract}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Trích xuất thông tin
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Extracted Data Preview */}
          {extractedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="font-bold text-green-800 mb-3">✓ Trích xuất thành công!</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Số CCCD:</span>
                  <span className="ml-2 font-medium">{extractedData.id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="ml-2 font-medium">{extractedData.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày sinh:</span>
                  <span className="ml-2 font-medium">{extractedData.dob || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Giới tính:</span>
                  <span className="ml-2 font-medium">{extractedData.sex || 'N/A'}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Thông tin đã được tự động điền vào form. Vui lòng kiểm tra và hoàn tất đăng ký.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedData && (
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
            >
              Tiếp tục đăng ký
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CCCDUpload;
