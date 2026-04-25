import Stripe from "stripe";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import StripeEvent from "../models/StripeEvent.js";
import { PLANS } from "../utils/plans.js";
import { sendPaymentConfirmationEmail } from "../services/emailService.js";
import { trackEvent, ANALYTICS_EVENTS } from "../services/analyticsService.js";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing. Billing features will be disabled.");
}

export function calculatePrice(basePrice) {
  const gst = basePrice * 0.18;
  const total = basePrice + gst;
  return { basePrice, gst, total };
}

export async function getPlans(_req, res) {
  try {
    const planList = Object.values(PLANS).map((p) => {
      const pricing = calculatePrice(p.basePrice);
      return {
        ...p,
        ...pricing,
      };
    });
    return res.json({ 
      success: true, 
      data: { plans: planList },
      message: "Plans fetched successfully"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
}

export async function createCheckoutSession(req, res) {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const { total } = calculatePrice(plan.basePrice);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🛡️ FAULT TOLERANCE: Stripe API Timeout protection
    const session = await Promise.race([
      stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `HydroSphere ${plan.name} Plan`,
                description: `Subscription for ${plan.name} plan`,
              },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/pricing`,
        customer_email: user.email,
        metadata: {
          userId: user._id.toString(),
          planId: plan.id,
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Stripe API Timeout")), 12000))
    ]);

    return res.json({ 
      success: true, 
      message: "Checkout session created",
      data: { id: session.id, url: session.url } 
    });
  } catch (err) {
    console.error("[STRIPE SESSION Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to create checkout session" });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[STRIPE WEBHOOK Error]:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // 💳 IDEMPOTENCY CHECK (Task #11 Audit Fix)
    const existingEvent = await StripeEvent.findOne({ eventId: event.id });
    if (existingEvent) {
      console.log(`[STRIPE WEBHOOK] Event ${event.id} already processed. Skipping.`);
      return res.json({ success: true, received: true });
    }

    const { userId, planId } = session.metadata;
    const plan = PLANS[planId];
    const { basePrice, gst, total } = calculatePrice(plan.basePrice);

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // Save subscription
    await Subscription.create({
      userId,
      plan: planId,
      price: basePrice,
      gst,
      total,
      expiry: expiryDate,
      stripeSessionId: session.id,
      status: "active",
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      plan: planId,
      subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: expiryDate,
    });

    // Send confirmation email
    const user = await User.findById(userId);
    if (user) {
      sendPaymentConfirmationEmail(user.email, user.name, plan.name, total, expiryDate)
        .catch(err => console.error("Failed to send payment email:", err));
    }

    // Track Event
    trackEvent(userId, ANALYTICS_EVENTS.PLAN_UPGRADED, { planId, total });

    // 💳 Mark as processed (Idempotency)
    await StripeEvent.create({ eventId: event.id, type: event.type });
  }

  res.json({ success: true, received: true });
}

export async function getMySubscription(req, res) {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId, status: "active" })
      .sort({ createdAt: -1 });
    
    return res.json({ 
      success: true, 
      data: subscription, 
      message: "Subscription fetched" 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch subscription" });
  }
}