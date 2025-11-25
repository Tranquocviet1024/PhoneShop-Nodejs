import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

const ImageUpload = ({ onImageUrlChange, initialImageUrl = '', disabled = false }) => {
  const [preview, setPreview] = useState(initialImageUrl || '');
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      setError('File quá lớn (tối đa 5MB)');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ ảnh (JPG, PNG, GIF, WebP)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data?.url) {
              const uploadedUrl = response.data.url;
              setImageUrl(uploadedUrl);
              onImageUrlChange(uploadedUrl);
              setProgress(100);
              // Reset progress after 1 second
              setTimeout(() => setProgress(0), 1000);
            } else {
              setError(response.error?.message || 'Upload failed');
            }
          } catch (err) {
            setError('Invalid response from server');
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            setError(err.error?.message || 'Upload failed');
          } catch {
            setError('Upload failed');
          }
        }
        setLoading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Network error. Vui lòng thử lại.');
        setLoading(false);
      });

      xhr.addEventListener('abort', () => {
        setError('Upload cancelled');
        setLoading(false);
      });

      // Send request
      xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/upload`, true);
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    } catch (err) {
      setError('Upload error: ' + err.message);
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setImageUrl('');
    setProgress(0);
    setError('');
    onImageUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenFilePicker = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenFilePicker}
          disabled={loading || disabled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          <Upload size={18} />
          {loading ? `Uploading... ${progress}%` : 'Choose Image'}
        </button>

        {preview && !loading && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            <X size={16} />
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-xs max-h-64 object-cover rounded border border-gray-200"
          />
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
                <p className="text-white text-sm mt-2">{progress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
        </div>
      )}

      {imageUrl && !loading && (
        <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
      )}
    </div>
  );
};

export default ImageUpload;
