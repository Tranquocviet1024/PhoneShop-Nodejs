const nodemailer = require('nodemailer');

// Determine email provider based on environment
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp', 'resend', 'resend-api'

// Resend API client (HTTP-based, works on all cloud platforms)
let resendClient = null;
if (EMAIL_PROVIDER === 'resend-api' || EMAIL_PROVIDER === 'resend') {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend API client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Resend client:', error.message);
  }
}

// Create nodemailer transporter for SMTP-based providers
let transporter = null;

if (EMAIL_PROVIDER === 'sendgrid') {
  // SendGrid SMTP
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
} else if (EMAIL_PROVIDER === 'brevo') {
  // Brevo (Sendinblue) SMTP
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_API_KEY,
    },
  });
} else if (EMAIL_PROVIDER === 'smtp') {
  // Default: Gmail SMTP (works locally only)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// Verify transporter configuration
const verifyTransporter = async () => {
  if (EMAIL_PROVIDER === 'resend-api' || EMAIL_PROVIDER === 'resend') {
    if (resendClient) {
      console.log(`✅ Email ready (Provider: Resend API)`);
      return true;
    }
    console.error('❌ Resend client not initialized');
    return false;
  }
  
  if (!transporter) {
    console.error('❌ No email transporter configured');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log(`✅ Email server is ready (Provider: ${EMAIL_PROVIDER})`);
    return true;
  } catch (error) {
    console.error(`❌ Email configuration error (Provider: ${EMAIL_PROVIDER}):`, error.message);
    return false;
  }
};

// Only verify in non-production or if explicitly enabled
if (process.env.NODE_ENV !== 'production' || process.env.VERIFY_EMAIL_ON_START === 'true') {
  verifyTransporter();
}

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
  
  // Determine sender email based on provider
  let fromEmail = process.env.EMAIL_USER;
  if (EMAIL_PROVIDER === 'resend-api' || EMAIL_PROVIDER === 'resend') {
    fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  } else if (EMAIL_PROVIDER === 'sendgrid') {
    fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
  } else if (EMAIL_PROVIDER === 'brevo') {
    fromEmail = process.env.BREVO_FROM_EMAIL || process.env.EMAIL_USER;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
              
              <!-- Header với gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <div style="width: 70px; height: 70px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; line-height: 70px;">
                          <span style="font-size: 32px;">📱</span>
                        </div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">PhoneShop</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Cửa hàng điện thoại uy tín</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Icon khóa -->
              <tr>
                <td style="text-align: center; padding-top: 30px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto; line-height: 80px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);">
                    <span style="font-size: 36px;">🔐</span>
                  </div>
                </td>
              </tr>
              
              <!-- Nội dung chính -->
              <tr>
                <td style="padding: 30px 40px;">
                  <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px; text-align: center; font-weight: 600;">Đặt lại mật khẩu</h2>
                  
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 15px;">
                    Xin chào <strong style="color: #667eea;">${userName || 'bạn'}</strong>,
                  </p>
                  
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 25px;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại PhoneShop. Nhấn vào nút bên dưới để tạo mật khẩu mới:
                  </p>
                  
                  <!-- Nút CTA -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center; padding: 10px 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                          🔑 Đặt lại mật khẩu
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Link backup -->
                  <div style="background-color: #f7fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <p style="color: #718096; font-size: 13px; margin: 0 0 10px;">
                      <strong>🔗 Hoặc copy link sau vào trình duyệt:</strong>
                    </p>
                    <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 0; background-color: #edf2f7; padding: 12px; border-radius: 8px; font-family: monospace;">
                      ${resetUrl}
                    </p>
                  </div>
                  
                  <!-- Cảnh báo -->
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 12px;">
                      ⚠️ Lưu ý quan trọng:
                    </p>
                    <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Link này sẽ <strong>hết hạn sau 1 giờ</strong></li>
                      <li>Nếu bạn không yêu cầu, hãy bỏ qua email này</li>
                      <li>Không chia sẻ link này với bất kỳ ai</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Phân cách -->
              <tr>
                <td style="padding: 0 40px;">
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; text-align: center;">
                  <p style="color: #a0aec0; font-size: 13px; margin: 0 0 15px;">
                    Cảm ơn bạn đã tin tưởng PhoneShop!
                  </p>
                  <div style="margin-bottom: 15px;">
                    <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none;">
                      <span style="font-size: 20px;">🌐</span>
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none;">
                      <span style="font-size: 20px;">📘</span>
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none;">
                      <span style="font-size: 20px;">📸</span>
                    </a>
                  </div>
                  <p style="color: #cbd5e0; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} PhoneShop. All rights reserved.
                  </p>
                  <p style="color: #cbd5e0; font-size: 11px; margin: 8px 0 0;">
                    Email này được gửi tự động, vui lòng không trả lời.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    // Use Resend API (HTTP-based, works on all cloud platforms)
    if ((EMAIL_PROVIDER === 'resend-api' || EMAIL_PROVIDER === 'resend') && resendClient) {
      const { data, error } = await resendClient.emails.send({
        from: `PhoneShop Support <${fromEmail}>`,
        to: [to],
        subject: 'Đặt lại mật khẩu - PhoneShop',
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent via Resend API:', data.id);
      return { success: true, messageId: data.id };
    }

    // Use nodemailer for other providers
    if (!transporter) {
      throw new Error('No email transporter configured');
    }

    const mailOptions = {
      from: `"PhoneShop Support" <${fromEmail}>`,
      to: to,
      subject: 'Đặt lại mật khẩu - PhoneShop',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending password reset email (Provider: ${EMAIL_PROVIDER}):`, error);
    throw error;
  }
};

module.exports = {
  transporter,
  resendClient,
  sendPasswordResetEmail,
  verifyTransporter,
  EMAIL_PROVIDER,
};
