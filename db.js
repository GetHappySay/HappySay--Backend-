// db.js

module.exports = {
  saveFeedback: async (feedback) => {
    console.log("Mock saving feedback:", feedback);
    return { id: "mock-feedback-id", ...feedback };
  },

  updateFeedbackRouted: async (feedbackId) => {
    console.log("Mock update for feedback ID:", feedbackId);
  }
};
