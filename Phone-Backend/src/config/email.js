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
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9fafb; padding: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #4F46E5; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PhoneShop</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${userName || 'bạn'},</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
          </div>
          <p>Hoặc copy link sau vào trình duyệt:</p>
          <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <div class="warning">
            <strong>⚠️ Lưu ý:</strong>
            <ul>
              <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              <li>Không chia sẻ link này với bất kỳ ai</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} PhoneShop. All rights reserved.</p>
          <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      </div>
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
