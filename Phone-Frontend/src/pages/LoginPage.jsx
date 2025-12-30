import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user: authUser } = useAuth();
  const navigate = useNavigate();

  // Redirect nếu đã đăng nhập - check role
  React.useEffect(() => {
    if (authUser) {
      const userRole = (authUser.role || '').toUpperCase();
      // Các role như ADMIN, STAFF, MANAGER, etc. đều vào admin dashboard
      // USER thường thì vào trang chính
      if (userRole === 'USER') {
        navigate('/');
      } else {
        // ADMIN, STAFF, MANAGER, và các role khác vào admin
        navigate('/admin/dashboard');
      }
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success && result.user) {
      // Role redirect được handle bởi useEffect
      // Không cần navigate ở đây
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
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
          Đăng nhập vào tài khoản của bạn
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-dark mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-600">Nhớ tôi</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-primary hover:text-accent transition"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-accent transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-primary font-bold hover:text-accent transition"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
