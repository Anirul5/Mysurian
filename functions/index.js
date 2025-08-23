const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors");

// Setup CORS middleware
const corsHandler = cors({
  origin: ["http://localhost:3000", "https://mysurian09.web.app"],
  methods: ["POST", "OPTIONS"], // Explicitly allow POST and OPTIONS
  allowedHeaders: ["Content-Type"], // Allow necessary headers
});

app.use(corsHandler);

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

exports.sendContactEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      return res.status(204).send(""); // Preflight OK
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .send("Missing required fields: name, email, message");
      }

      const mailOptions = {
        from: email,
        to: functions.config().gmail.user,
        subject: `New Contact Form Submission from ${name}`,
        text: `You received a new message from ${name} (${email}):\n\n${message}`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).send("Message sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Failed to send message");
    }
  });
});
