
const express = require("express");
const router = express.Router();
const db = {
  saveFeedback: async (feedback) => {
    console.log("Mock saving feedback:", feedback);
    return { id: "mock-feedback-id", ...feedback };
  },
  updateFeedbackRouted: async (feedbackId) => {
    console.log("Mock update for feedback ID:", feedbackId);
  },
};

// Feedback submission
router.post("/api/feedback/:visit_id", async (req, res) => {
  const { visit_id } = req.params;
  const { rating, comment } = req.body;

  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating." });
    }

    // Save feedback
    const feedback = await db.saveFeedback({
      visit_id,
      rating,
      comment,
      sentiment: null,  // placeholder for AI sentiment analysis
      routed_to_google: false,
      created_at: new Date().toISOString()
    });

    // Determine routing
    let routing = "internal";
    if (rating === 5) {
      routing = "google";
      // Mark as routed to Google
      await db.updateFeedbackRouted(feedback.id, true);
    } else if (rating === 4) {
      // In MVP, route based on optional comment later
      routing = "pending_comment";
    }

    res.status(200).json({ message: "Feedback recorded.", feedback_id: feedback.id, routing });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
module.exports = router;
