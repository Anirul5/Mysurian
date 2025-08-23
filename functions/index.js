const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Automatically parse JSON bodies
app.use(express.json());

// Setup CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://mysurian09.web.app"],
    methods: ["POST", "OPTIONS"],
  })
);

// Root healthcheck route for Cloud Run
app.get("/", (req, res) => {
  res.send("API is running");
});

// Contact form endpoint
app.post("/sendContactEmail", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res
        .status(400)
        .send("Missing required fields: name, email, message");
    }

    // Configure transporter inside request to prevent startup failures
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: functions.config().gmail.user,
        pass: functions.config().gmail.pass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: email,
      to: functions.config().gmail.user,
      subject: `New Contact Form Submission from ${name}`,
      text: `You received a new message from ${name} (${email}):\n\n${message}`,
    });

    return res.status(200).send("Message sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).send("Failed to send message");
  }
});

// Export Express app as Firebase Function
exports.api = functions.https.onRequest(app);
