import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Camera } from 'lucide-react';
import CCCDUpload from '../components/CCCDUpload';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCCCDUpload, setShowCCCDUpload] = useState(false);
  const { register, user: authUser } = useAuth();
  const navigate = useNavigate();

  // Redirect nếu đã đăng nhập - check role
  React.useEffect(() => {
    if (authUser) {
      const userRole = (authUser.role || '').toUpperCase();
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [authUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCCCDDataExtracted = (cccdData) => {
    // Map CCCD data to form fields
    setFormData((prev) => ({
      ...prev,
      fullName: cccdData.name || prev.fullName,
      // You can add more mappings if you extend the form
      // e.g., dateOfBirth: cccdData.dob, address: cccdData.residence, etc.
    }));
    
    // Close the upload modal
    setShowCCCDUpload(false);
    
    // Show success message
    setSuccess('Đã tự động điền thông tin từ CCCD. Vui lòng kiểm tra và hoàn tất đăng ký.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
    });

    if (result.success && result.user) {
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      // Role redirect được handle bởi useEffect
    } else {
      setError(result.error || 'Đăng ký thất bại');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-3xl">📱</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-dark mb-2">
          PhoneShop
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Tạo tài khoản mới
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-green-800 text-sm">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* CCCD Auto-fill Button */}
          <button
            type="button"
            onClick={() => setShowCCCDUpload(true)}
            className="w-full px-4 py-3 border-2 border-dashed border-primary rounded-lg text-primary font-semibold hover:bg-primary hover:text-white transition flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            Tự động điền từ CCCD
          </button>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-dark mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-dark mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="nguyenvana"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-dark mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-dark mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-dark mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2">
            <input type="checkbox" className="w-4 h-4 mt-1" required />
            <span className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <button
                onClick={() => alert('Xem Điều khoản dịch vụ')}
                className="text-primary hover:text-accent underline"
              >
                Điều khoản dịch vụ
              </button>
              {' '}và{' '}
              <button
                onClick={() => alert('Xem Chính sách riêng tư')}
                className="text-primary hover:text-accent underline"
              >
                Chính sách riêng tư
              </button>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-primary font-bold hover:text-accent transition"
          >
            Đăng nhập ngay
          </Link>
        </p>
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

export default RegisterPage;
