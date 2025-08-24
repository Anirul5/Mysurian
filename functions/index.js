const { onRequest } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // reflects request origin

// 🔐 Secrets from Google Secret Manager (never in code/repo)
const gmailUser = defineSecret("GMAIL_USER");
const gmailPass = defineSecret("GMAIL_PASS");

exports.sendContactEmail = onRequest(
  { secrets: [gmailUser, gmailPass] },
  (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST")
        return res.status(405).send("Method Not Allowed");

      const { name, email, message } = req.body || {};
      if (!name || !email || !message) {
        return res
          .status(400)
          .send("Missing required fields: name, email, message");
      }

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser.value(),
            pass: gmailPass.value(),
          },
        });

        await transporter.sendMail({
          from: `"Mysurian Contact" <${gmailUser.value()}>`,
          replyTo: email,
          to: gmailUser.value(),
          subject: `New Contact Form Submission from ${name}`,
          text: `From: ${name} (${email})\n\n${message}`,
        });

        return res.status(200).send("Message sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).send(`Failed to send message: ${error.message}`);
      }
    });
  }
);
