
const express = require("express");
const app = express();
const cors = require("cors");
const posRoutes = require("./happysay_pos_nfc_routes");
const feedbackRoutes = require("./happysay_feedback_route");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(posRoutes);
app.use(feedbackRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("HappySay API is live!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
