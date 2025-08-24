import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";

const ContactModal = ({ open, handleClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFeedback({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!name.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Name and message cannot be empty." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "https://us-central1-mysurian09.cloudfunctions.net/sendContactEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        }
      );

      if (response.ok) {
        setFeedback({ type: "success", text: "Message sent successfully!" });
        setName("");
        setEmail("");
        setMessage("");
      } else if (response.status === 0 || response.type === "opaque") {
        // Handle CORS or network-related failures
        setFeedback({
          type: "error",
          text: "Unable to connect to the server. Please check your network or contact support.",
        });
      } else {
        const errMsg = await response.text();
        setFeedback({
          type: "error",
          text: errMsg || "Failed to send message.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setFeedback({
        type: "error",
        text: "Network error, please try again or check server configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Contact Us</DialogTitle>
      <DialogContent>
        {feedback && (
          <Alert
            severity={feedback.type}
            sx={{ mb: 2 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.text}
          </Alert>
        )}

        <TextField
          label="Your Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Your Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Message"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="secondary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
