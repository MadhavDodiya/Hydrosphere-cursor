import dotenv from "dotenv";
dotenv.config();
import { verifyEmailConnection, sendEmail } from "./services/emailService.js";

console.log("\n🔍 HydroSphere Email Diagnostics (Using emailService.js)\n");

// ── 1. Check env vars ───────────────────────────────────────────
console.log("1️⃣  Checking environment variables...");
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const service = process.env.EMAIL_SERVICE;

if (!user) { console.error("   ❌ SMTP_USER/EMAIL_USER is missing"); process.exit(1); }
if (!pass) { console.error("   ❌ SMTP_PASS/EMAIL_PASS is missing"); process.exit(1); }
console.log(`   ✅ SMTP_USER = ${user}`);
console.log(`   ✅ SMTP_PASS = ${"*".repeat(pass.length)} (${pass.length} chars)`);
console.log(`   ✅ EMAIL_SERVICE = ${service || "gmail (default)"}`);

// ── 2. Verify SMTP connection ───────────────────────────────────
console.log("\n2️⃣  Verifying SMTP connection via emailService.js...");
const isConnected = await verifyEmailConnection();

if (!isConnected) {
  console.error("\n   📋 Common fixes:");
  console.error("   → Make sure 2FA is enabled on your Google account");
  console.error("   → Generate a new App Password at: https://myaccount.google.com/apppasswords");
  console.error("   → The app password must NOT have spaces when copied");
  process.exit(1);
}

// ── 3. Send test email ──────────────────────────────────────────
console.log("\n3️⃣  Sending test inquiry notification email...");
const emailSent = await sendEmail({
  to: user, // send to self for testing
  subject: "✅ Test: New Inquiry Notification",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:10px;">
      <h2 style="color:#0891b2;">🎉 Email notifications are working!</h2>
      <p>This is a test inquiry email from HydroSphere using the central <strong>emailService.js</strong>.</p>
      <div style="background:#f8fafc;padding:15px;border-left:4px solid #2563eb;margin:20px 0;">
        <p style="margin:0;"><strong>From:</strong> Test Buyer</p>
        <p style="margin:0;"><strong>Listing:</strong> Green Hydrogen Supply — Mumbai</p>
        <p style="margin:8px 0 0;"><em>"We need 500kg of green hydrogen by next week. Please quote your best price."</em></p>
      </div>
      <p>If you're seeing this email, inquiry notifications are correctly configured!</p>
      <p>Check your <strong>Spam / Promotions</strong> folder if you were missing previous emails.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
      <p style="font-size:12px;color:#64748b;">HydroSphere Diagnostic — ${new Date().toLocaleString("en-IN")}</p>
    </div>
  `,
});

if (emailSent) {
  console.log("   ✅ Test email sent!");
  console.log(`   📬 Check inbox: ${user}`);
  console.log("\n   ⚠️  If you don't see it in INBOX — check your Spam / Promotions tab!");
} else {
  console.error("   ❌ Failed to send test email.");
}
