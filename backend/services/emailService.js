import nodemailer from 'nodemailer';

// Configure the transporter.
// Reads SMTP_USER and SMTP_PASS from your backend/.env file.
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER, // e.g. "madhavdodiya2017@gmail.com"
      pass: process.env.SMTP_PASS  // e.g. "knae rqnr lsmp qpbt" (Gmail App Password)
    }
  });
};

/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials not found. Skipping email send to:", to);
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HydroSphere Notifications" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return false;
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
  return sendEmail(supplierEmail, subject, html);
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
  return sendEmail(supplierEmail, subject, html);
};
