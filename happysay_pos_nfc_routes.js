
const express = require("express");
const router = express.Router();
const { sendSMS } = require("./utils/twilio"); // Your Twilio utility
const db = require("./db"); // Your DB connection/query functions

// POS Visit Trigger
router.post("/api/visit/pos", async (req, res) => {
  const { location_id, phone_number, timestamp } = req.body;

  try {
    // Check cooldown (e.g., 7 days)
    const lastPrompt = await db.getLastPrompt(phone_number, location_id);
    const now = new Date();

    if (lastPrompt && (now - new Date(lastPrompt)) < 7 * 24 * 60 * 60 * 1000) {
      return res.status(200).json({ message: "Cooldown active, no prompt sent." });
    }

    // Get or create contact
    const contact = await db.getOrCreateContact(phone_number);

    // Create visit
    const visit = await db.createVisit({
      contact_id: contact.id,
      location_id,
      source: "POS",
      timestamp: timestamp || new Date().toISOString()
    });

    // Send SMS
    const feedbackLink = `https://gethappysay.com/feedback/${visit.id}`;
    const message = `Thanks for visiting! We'd love your feedback: ${feedbackLink}`;
    const twilioResp = await sendSMS(phone_number, message);

    // Log message
    await db.logMessage({
      contact_id: contact.id,
      visit_id: visit.id,
      message_type: "feedback_prompt",
      status: "sent",
      sent_at: now.toISOString(),
      twilio_sid: twilioResp.sid
    });

    res.status(200).json({ message: "Prompt sent.", visit_id: visit.id });
  } catch (error) {
    console.error("POS visit error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// NFC Visit Trigger
router.post("/api/visit/nfc", async (req, res) => {
  const { location_id, phone_number } = req.body;

  try {
    const contact = await db.getOrCreateContact(phone_number);

    const visit = await db.createVisit({
      contact_id: contact.id,
      location_id,
      source: "NFC",
      timestamp: new Date().toISOString()
    });

    const feedbackLink = `https://gethappysay.com/feedback/${visit.id}`;
    const message = `Thanks for your visit! Tell us how we did: ${feedbackLink}`;
    const twilioResp = await sendSMS(phone_number, message);

    await db.logMessage({
      contact_id: contact.id,
      visit_id: visit.id,
      message_type: "feedback_prompt",
      status: "sent",
      sent_at: new Date().toISOString(),
      twilio_sid: twilioResp.sid
    });

    res.status(200).json({ message: "Prompt sent via NFC.", visit_id: visit.id });
  } catch (error) {
    console.error("NFC visit error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
