import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import PayOSPaymentPage from './pages/PayOSPaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ComparePage from './pages/ComparePage';
import FlashSalePage from './pages/FlashSalePage';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-light flex flex-col">
            <Routes>
              {/* Admin Routes (không có header/footer) */}
              <Route
                path="/admin/dashboard"
                element={<ProtectedRoute Component={AdminDashboard} requiredRole="ADMIN" allowStaff={false} />}
              />

              {/* Customer Routes - với Header/Footer layout */}
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <HomePage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/products"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProductsPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/products/:id"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProductDetailPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/cart"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <CartPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/checkout"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={CheckoutPage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* PayOS Payment Routes */}
              <Route
                path="/payment/payos"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={PayOSPaymentPage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/payment/success"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <PaymentSuccessPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/payment/cancel"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <PaymentCancelPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/register"
                element={<RegisterPage />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />

              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
              />

              {/* Placeholder routes */}
              <Route
                path="/categories"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <HomePage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/about"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <AboutPage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/profile"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={ProfilePage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/orders"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={OrdersPage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={WishlistPage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/notifications"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ProtectedRoute Component={NotificationsPage} />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Compare Page */}
              <Route
                path="/compare"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <ComparePage />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Flash Sale Pages */}
              <Route
                path="/flash-sale"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <FlashSalePage />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/flash-sale/:id"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <FlashSalePage />
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
