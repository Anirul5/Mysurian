const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// Enable CORS before other middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://mycurian09.web.app"], // Exact origins
    methods: ["POST", "OPTIONS"], // Ensure OPTIONS is included
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
    optionsSuccessStatus: 200, // Some browsers require this for preflight
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/sendContactEmail", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .send("Missing required fields: name, email, message");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: functions.config().gmail.user,
        pass: functions.config().gmail.pass,
      },
    });

    await transporter.verify();
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

exports.sendContactEmail = functions.https.onRequest(app);
