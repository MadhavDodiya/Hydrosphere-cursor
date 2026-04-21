import nodemailer from "nodemailer";

// Lazy-create transporter or create once at module load
// Singleton pattern to reuse connection pool
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email using the pre-configured singleton transporter.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || '"HydroSphere Marketplace" <noreply@hydrosphere.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    // Returning null instead of throwing so it doesn't crash the calling process
    return null;
  }
};
