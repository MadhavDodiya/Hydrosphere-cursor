import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { PLANS } from "../utils/plans.js";
import { sendEmail } from "../services/emailService.js";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Missing Razorpay credentials");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function getPriceForPlan(planId) {
  if (planId === "pro_supplier") return 4999; // ₹4999
  if (planId === "enterprise") return 19999; // ₹19999
  return 0;
}

export async function getPlans(_req, res) {
  return res.json({
    plans: Object.values(PLANS).map((p) => ({
      ...p,
      price: getPriceForPlan(p.id),
    })),
  });
}

/**
 * POST /api/billing/create-order
 * Body: { planId }
 */
export async function createOrder(req, res) {
  try {
    const razorpay = getRazorpay();
    const { planId } = req.body || {};

    if (!["pro_supplier", "enterprise"].includes(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const price = getPriceForPlan(planId);
    if (!price) {
      return res.status(400).json({ message: "Invalid plan price" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const options = {
      amount: price * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[BILLING CREATE ORDER Error]:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
}

/**
 * POST /api/billing/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }
 */
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature, payment verification failed" });
    }

    // Payment is successful, update user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = planId;
    user.subscriptionStatus = "active";
    user.razorpayOrderId = razorpay_order_id;
    // Set current period end to 1 year from now for one-time payments acting as yearly subscriptions
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    user.subscriptionCurrentPeriodEnd = nextYear;

    await user.save();

    // Send payment confirmation email (non-blocking)
    const planName = planId === "pro_supplier" ? "Pro Supplier" : "Enterprise";
    const planPrice = getPriceForPlan(planId);
    sendEmail(
      user.email,
      `✅ Payment Successful — HydroSphere ${planName} Plan`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:10px;">
        <h2 style="color:#0891b2;">Payment Successful! 🎉</h2>
        <p>Hello ${user.name},</p>
        <p>Your payment of <strong>₹${planPrice}</strong> for the <strong>${planName}</strong> plan has been received.</p>
        <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #16a34a;">
          <strong>Order ID:</strong> ${razorpay_order_id}<br/>
          <strong>Payment ID:</strong> ${razorpay_payment_id}<br/>
          <strong>Plan Active Until:</strong> ${nextYear.toLocaleDateString("en-IN")}
        </div>
        <p>You can now access all <strong>${planName}</strong> features. Log in to your dashboard to start using them.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Go to Dashboard</a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
        <p style="font-size:12px;color:#64748b;">HydroSphere — B2B Hydrogen Marketplace</p>
      </div>`
    ).catch(err => console.error("[BILLING] Payment email failed:", err.message));

    return res.json({ message: "Payment verified and plan updated successfully", plan: user.plan });
  } catch (err) {
    console.error("[BILLING VERIFY Error]:", err);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
}

/**
 * GET /api/billing/me
 */
export async function getMySubscription(req, res) {
  try {
    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus subscriptionCurrentPeriodEnd"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      plan: user.plan || "free",
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    });
  } catch (err) {
    console.error("[BILLING ME Error]:", err);
    return res.status(500).json({ message: "Failed to load subscription" });
  }
}
