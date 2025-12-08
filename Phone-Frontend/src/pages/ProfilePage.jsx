import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, User, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import CCCDUpload from '../components/CCCDUpload';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCCCDUpload, setShowCCCDUpload] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      console.log('Profile response:', response.data);
      let data = response.data;
      if (data?.data && typeof data.data === 'object') {
        data = data.data;
      }
      setProfile(data);
      setEditData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback: Dùng user từ AuthContext
      if (user) {
        setProfile(user);
        setEditData(user);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate, fetchProfile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCCCDDataExtracted = (cccdData) => {
    // Map CCCD data to profile fields
    setEditData(prev => ({
      ...prev,
      username: cccdData.name || prev.username,
      fullName: cccdData.name || prev.fullName,
      address: cccdData.residence || prev.address,
    }));
    
    setShowCCCDUpload(false);
    setSuccess('Đã tự động điền thông tin từ CCCD. Vui lòng kiểm tra và lưu thay đổi.');
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.put('/profile', {
        username: editData.username,
        fullName: editData.fullName,
        phone: editData.phone,
        address: editData.address
      });

      console.log('Update response:', response.data);
      setSuccess('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      
      let data = response.data;
      if (data?.data && typeof data.data === 'object') {
        data = data.data;
      }
      setProfile(data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không thể tải hồ sơ</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-light py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-dark">Hồ Sơ Của Tôi</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
              >
                <Edit2 size={18} />
                Chỉnh Sửa
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              {/* CCCD Auto-fill Button */}
              <button
                type="button"
                onClick={() => setShowCCCDUpload(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-primary rounded-lg text-primary font-semibold hover:bg-primary hover:text-white transition flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Tự động điền từ CCCD
              </button>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  <User size={18} className="inline mr-2" />
                  Tên Tài Khoản
                </label>
                <input
                  type="text"
                  name="username"
                  value={editData.username || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Nhập tên tài khoản"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  <User size={18} className="inline mr-2" />
                  Tên Đầy Đủ
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editData.fullName || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Nhập tên đầy đủ"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  <Mail size={18} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  <Phone size={18} className="inline mr-2" />
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">
                  <MapPin size={18} className="inline mr-2" />
                  Địa Chỉ
                </label>
                <textarea
                  name="address"
                  value={editData.address || ''}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Nhập địa chỉ"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-accent transition"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(profile);
                  }}
                  className="flex-1 border-2 border-gray-300 text-dark py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark">{profile.fullName || profile.username}</p>
                  <p className="text-gray-600">Thành viên</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Tên Tài Khoản</p>
                <p className="text-lg text-dark">{profile.username}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </p>
                <p className="text-lg text-dark">{profile.email}</p>
              </div>

              {profile.phone && (
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">
                    <Phone size={16} className="inline mr-2" />
                    Số Điện Thoại
                  </p>
                  <p className="text-lg text-dark">{profile.phone}</p>
                </div>
              )}

              {profile.address && (
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">
                    <MapPin size={16} className="inline mr-2" />
                    Địa Chỉ
                  </p>
                  <p className="text-lg text-dark">{profile.address}</p>
                </div>
              )}

              {profile.createdAt && (
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">
                    <Calendar size={16} className="inline mr-2" />
                    Ngày Tạo Tài Khoản
                  </p>
                  <p className="text-lg text-dark">
                    {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {profile.role && (
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Vai Trò</p>
                  <p className="text-lg">
                    <span className={`px-3 py-1 rounded-full text-white font-bold ${
                      profile.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {profile.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          Đăng Xuất
        </button>
      </div>

      {/* CCCD Upload Modal */}
      {showCCCDUpload && (
        <CCCDUpload
          onDataExtracted={handleCCCDDataExtracted}
          onClose={() => setShowCCCDUpload(false)}
        />
      )}
    </main>
  );
};

export default ProfilePage;
