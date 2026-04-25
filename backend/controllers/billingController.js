import Stripe from "stripe";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { PLANS } from "../utils/plans.js";
import { sendEmail } from "../services/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function calculatePrice(basePrice) {
  const gst = basePrice * 0.18;
  const total = basePrice + gst;
  return { basePrice, gst, total };
}

export async function getPlans(_req, res) {
  const planList = Object.values(PLANS).map((p) => {
    const pricing = calculatePrice(p.basePrice);
    return {
      ...p,
      ...pricing,
    };
  });
  return res.json({ plans: planList });
}

export async function createCheckoutSession(req, res) {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const { total } = calculatePrice(plan.basePrice);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `HydroSphere ${plan.name} Plan`,
              description: `Subscription for ${plan.name} plan`,
            },
            unit_amount: Math.round(total * 100), // Stripe expects amount in paise for INR
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
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("[STRIPE SESSION Error]:", err);
    return res.status(500).json({ message: "Failed to create checkout session" });
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
    sendEmail({
      to: user.email,
      subject: `✅ Payment Successful — HydroSphere ${plan.name} Plan`,
      html: `<h1>Payment Successful!</h1>
             <p>Hello ${user.name}, your payment of ₹${total} for the ${plan.name} plan was successful.</p>
             <p>Plan active until: ${expiryDate.toLocaleDateString()}</p>`
    }).catch(err => console.error("Failed to send payment email:", err));
  }

  res.json({ received: true });
}

export async function getMySubscription(req, res) {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId, status: "active" })
      .sort({ createdAt: -1 });
    
    return res.json(subscription);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch subscription" });
  }
}