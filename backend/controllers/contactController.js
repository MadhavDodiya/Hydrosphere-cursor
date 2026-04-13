import Contact from "../models/Contact.js";

/**
 * POST /api/contacts
 * Public route to submit a contact message.
 */
export async function submitContact(req, res) {
  try {
    const { user_name, user_email, user_phone, user_role, subject, message } = req.body || {};

    if (!user_name || !user_email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const contact = await Contact.create({
      name: user_name,
      email: user_email,
      phone: user_phone,
      userType: user_role,
      subject: subject || "General Inquiry",
      message: message
    });

    return res.status(201).json({ 
      success: true, 
      message: "Contact message received", 
      data: contact 
    });
  } catch (err) {
    console.error("Contact Submission Error:", err);
    return res.status(500).json({ message: "Failed to submit contact message" });
  }
}
