/**
 * Email Service
 * Handles sending various email notifications
 */
const nodemailer = require('nodemailer');

// Create transporter (configure based on environment)
const createTransporter = () => {
  // For development/testing, use ethereal email
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  // For production, use configured SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (order, user) => {
  try {
    const transporter = createTransporter();
    
    const orderItems = order.items || [];
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.productName}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatCurrency(item.price)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"PhoneShop" <${process.env.SMTP_FROM || 'noreply@phoneshop.com'}>`,
      to: user.email,
      subject: `Xác nhận đơn hàng #${order.id} - PhoneShop`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background: #f1f1f1; padding: 12px; text-align: left; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .status-badge { display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📱 PhoneShop</h1>
              <p>Cảm ơn bạn đã đặt hàng!</p>
            </div>
            
            <div class="content">
              <h2>Xin chào ${user.fullName || user.username},</h2>
              
              <p>Đơn hàng của bạn đã được tiếp nhận thành công. Dưới đây là thông tin chi tiết:</p>
              
              <div class="order-info">
                <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge">${getStatusText(order.status)}</span></p>
                <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
              </div>

              <h3>Chi tiết đơn hàng</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tạm tính:</strong></td>
                    <td style="padding: 10px; text-align: right;">${formatCurrency(order.subtotal || order.totalAmount)}</td>
                  </tr>
                  ${order.discountAmount ? `
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; color: #28a745;"><strong>Giảm giá:</strong></td>
                    <td style="padding: 10px; text-align: right; color: #28a745;">-${formatCurrency(order.discountAmount)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Phí vận chuyển:</strong></td>
                    <td style="padding: 10px; text-align: right;">${order.shippingFee ? formatCurrency(order.shippingFee) : 'Miễn phí'}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #333;"><strong>Tổng cộng:</strong></td>
                    <td style="padding: 15px; text-align: right; border-top: 2px solid #333; color: #e74c3c;">${formatCurrency(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              <div class="order-info">
                <h4>📍 Địa chỉ giao hàng</h4>
                <p>${order.shippingAddress || 'Chưa cung cấp'}</p>
                <p><strong>Số điện thoại:</strong> ${order.phone || user.phone || 'Chưa cung cấp'}</p>
              </div>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="btn">
                  Theo dõi đơn hàng
                </a>
              </p>

              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PhoneShop. All rights reserved.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', info.messageId);
    
    // For development, log preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email
 */
const sendOrderStatusUpdate = async (order, user, newStatus, trackingInfo = null) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      confirmed: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.',
      processing: 'Đơn hàng của bạn đang được xử lý.',
      shipped: 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.',
      out_for_delivery: 'Đơn hàng của bạn đang được giao đến bạn.',
      delivered: 'Đơn hàng của bạn đã được giao thành công.',
      cancelled: 'Đơn hàng của bạn đã bị hủy.',
      refunded: 'Đơn hàng của bạn đã được hoàn tiền.'
    };

    const trackingSection = trackingInfo ? `
      <div class="order-info">
        <h4>📦 Thông tin vận chuyển</h4>
        <p><strong>Đơn vị vận chuyển:</strong> ${trackingInfo.carrier || 'Đang cập nhật'}</p>
        <p><strong>Mã vận đơn:</strong> ${trackingInfo.trackingNumber || 'Đang cập nhật'}</p>
        ${trackingInfo.estimatedDelivery ? `<p><strong>Dự kiến giao:</strong> ${formatDate(trackingInfo.estimatedDelivery)}</p>` : ''}
      </div>
    ` : '';

    const mailOptions = {
      from: `"PhoneShop" <${process.env.SMTP_FROM || 'noreply@phoneshop.com'}>`,
      to: user.email,
      subject: `Cập nhật đơn hàng #${order.id} - ${getStatusText(newStatus)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 8px 20px; background: ${getStatusColor(newStatus)}; color: white; border-radius: 20px; font-size: 16px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📱 PhoneShop</h1>
              <p>Cập nhật đơn hàng</p>
            </div>
            
            <div class="content">
              <h2>Xin chào ${user.fullName || user.username},</h2>
              
              <p>${statusMessages[newStatus] || 'Đơn hàng của bạn đã được cập nhật.'}</p>
              
              <div class="order-info" style="text-align: center;">
                <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                <p><strong>Trạng thái mới:</strong></p>
                <p><span class="status-badge">${getStatusText(newStatus)}</span></p>
              </div>

              ${trackingSection}

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="btn">
                  Xem chi tiết đơn hàng
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PhoneShop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order status update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmation = async (order, user, payment) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PhoneShop" <${process.env.SMTP_FROM || 'noreply@phoneshop.com'}>`,
      to: user.email,
      subject: `Xác nhận thanh toán đơn hàng #${order.id} - PhoneShop`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .payment-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .success-icon { font-size: 48px; }
            .btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p class="success-icon">✅</p>
              <h1>Thanh toán thành công!</h1>
            </div>
            
            <div class="content">
              <h2>Xin chào ${user.fullName || user.username},</h2>
              
              <p>Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn.</p>
              
              <div class="payment-info">
                <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                <p><strong>Mã giao dịch:</strong> ${payment.transactionId || payment.id}</p>
                <p><strong>Số tiền:</strong> ${formatCurrency(payment.amount || order.totalAmount)}</p>
                <p><strong>Phương thức:</strong> ${getPaymentMethodText(payment.paymentMethod || order.paymentMethod)}</p>
                <p><strong>Thời gian:</strong> ${formatDate(payment.createdAt || new Date())}</p>
              </div>

              <p>Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất.</p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.id}" class="btn">
                  Theo dõi đơn hàng
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PhoneShop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send promotional email
 */
const sendPromotionalEmail = async (user, subject, content, couponCode = null) => {
  try {
    const transporter = createTransporter();
    
    const couponSection = couponCode ? `
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <p style="color: white; margin: 0;">Sử dụng mã giảm giá:</p>
        <h2 style="color: white; font-size: 28px; letter-spacing: 3px; margin: 10px 0;">${couponCode}</h2>
      </div>
    ` : '';

    const mailOptions = {
      from: `"PhoneShop" <${process.env.SMTP_FROM || 'noreply@phoneshop.com'}>`,
      to: user.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📱 PhoneShop</h1>
            </div>
            
            <div class="content">
              <h2>Xin chào ${user.fullName || user.username},</h2>
              
              ${content}

              ${couponSection}

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">
                  Mua sắm ngay
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PhoneShop. All rights reserved.</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe">Hủy đăng ký nhận email</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Promotional email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending promotional email:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    out_for_delivery: 'Đang giao',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ffc107',
    confirmed: '#17a2b8',
    processing: '#007bff',
    shipped: '#6f42c1',
    out_for_delivery: '#fd7e14',
    delivered: '#28a745',
    completed: '#28a745',
    cancelled: '#dc3545',
    refunded: '#6c757d'
  };
  return colorMap[status] || '#6c757d';
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng/ghi nợ',
    momo: 'Ví MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
  };
  return methodMap[method] || method;
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentConfirmation,
  sendPromotionalEmail
};
