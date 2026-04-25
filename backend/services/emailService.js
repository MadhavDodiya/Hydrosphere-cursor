import nodemailer from 'nodemailer';

// Standardize on SMTP_* environment variables
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

// Singleton transporter to reuse connections
const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true' || SMTP_PORT == 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Verify SMTP connection
 */
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully.");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    return false;
  }
};

/**
 * Send an email notification
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      if (!SMTP_USER || !SMTP_PASS) {
        console.warn("⚠️ SMTP credentials not found. Skipping email send to:", to);
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"HydroSphere Notifications" <${SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || "",
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully (Attempt ${attempts}):`, info.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Email send attempt ${attempts} failed:`, error.message);
      if (attempts >= maxAttempts) return false;
      // Exponential backoff: 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
};

/**
 * Pre-defined Email Templates
 */
export const sendInquiryEmail = async (supplierEmail, buyerName, listingTitle, message) => {
  const subject = `New Inquiry for ${listingTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0891b2;">You received a new inquiry!</h2>
      <p>Hello,</p>
      <p><strong>${buyerName}</strong> has sent you a new inquiry regarding your listing: <strong>${listingTitle}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0;"><em>"${message}"</em></p>
      </div>
      <p>Log in to your HydroSphere dashboard to reply.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated message from HydroSphere.</p>
    </div>
  `;
  return sendEmail({ to: supplierEmail, subject, html });
};

export const sendApprovalEmail = async (supplierEmail, supplierName) => {
  const subject = `Your HydroSphere Account is Approved! 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0891b2;">Welcome to HydroSphere!</h2>
      <p>Hello ${supplierName},</p>
      <p>Great news! Your supplier account has been <strong>approved</strong> by our admin team.</p>
      <p>You can now log in and start publishing your hydrogen listings to the marketplace.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated message from HydroSphere.</p>
    </div>
  `;
  return sendEmail({ to: supplierEmail, subject, html });
};

export const sendReplyNotificationEmail = async (recipientEmail, senderName, listingTitle, message) => {
  const subject = `New message for ${listingTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0891b2;">You received a new reply!</h2>
      <p>Hello,</p>
      <p><strong>${senderName}</strong> has replied to your inquiry for <strong>${listingTitle}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0;"><em>"${message}"</em></p>
      </div>
      <p>Log in to your HydroSphere dashboard to view the full thread.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated message from HydroSphere.</p>
    </div>
  `;
  return sendEmail({ to: recipientEmail, subject, html });
};

export const sendListingStatusEmail = async (supplierEmail, supplierName, listingTitle, status) => {
  const isApproved = status === "approved";
  const subject = `Your Listing "${listingTitle}" has been ${status}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: ${isApproved ? "#16a34a" : "#dc2626"};">Listing ${isApproved ? "Approved" : "Rejected"}</h2>
      <p>Hello ${supplierName || "Supplier"},</p>
      <p>Your listing <strong>${listingTitle}</strong> has been <strong>${status}</strong> by our moderation team.</p>
      ${isApproved 
        ? `<p>It is now live on the HydroSphere marketplace.</p>` 
        : `<p>Please log in to your dashboard to review and update your listing based on our guidelines.</p>`
      }
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated message from HydroSphere.</p>
    </div>
  `;
  return sendEmail({ to: supplierEmail, subject, html });
};

/**
 * Send a welcome email after successful verification
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = `Welcome to HydroSphere! 🚀`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0891b2;">Welcome aboard, ${userName}!</h2>
      <p>We're thrilled to have you as part of the HydroSphere community.</p>
      <p>Your email has been successfully verified, and your account is now fully active.</p>
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #0369a1; margin-top: 0;">Next Steps:</h3>
        <ul style="padding-left: 20px;">
          <li>Explore the hydrogen marketplace.</li>
          <li>Save your favorite listings for easy access.</li>
          <li>Connect with industry leaders.</li>
        </ul>
      </div>
      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/marketplace" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Marketplace</a>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">If you have any questions, feel free to reply to this email.</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
};

/**
 * Send a verification email during registration or resend
 */
export const sendVerificationEmail = async (userEmail, token, appBaseUrl) => {
  const verificationLink = `${appBaseUrl}/verify-email?token=${token}&email=${encodeURIComponent(userEmail)}`;
  const subject = "Verify your HydroSphere email 💧";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0891b2; margin: 0;">Welcome to HydroSphere!</h2>
        <p style="color: #64748b;">The Future of Hydrogen Commerce</p>
      </div>
      <p>Hello,</p>
      <p>Thank you for joining HydroSphere. Please verify your email address to activate your account and start exploring the marketplace.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">Verify My Email</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} HydroSphere India. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (userEmail, token, appBaseUrl) => {
  const resetLink = `${appBaseUrl}/reset-password?token=${token}&email=${encodeURIComponent(userEmail)}`;
  const subject = "Reset your HydroSphere password 🔑";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0891b2;">Password Reset Request</h2>
      <p>We received a request to reset the password for your HydroSphere account. If you didn't make this request, you can ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">Reset Password</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">This link will expire in 30 minutes for security reasons.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} HydroSphere India. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
};

/**
 * Send a payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (userEmail, userName, planName, amount, expiryDate) => {
  const subject = `✅ Payment Successful — HydroSphere ${planName} Plan`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #10b981;">Payment Successful!</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for subscribing to the <strong>${planName}</strong> plan. Your payment of <strong>₹${amount}</strong> (including GST) has been processed successfully.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Active Until:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
      </div>
      <p>You now have full access to premium features including listing publication and lead management.</p>
      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} HydroSphere India. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
};


