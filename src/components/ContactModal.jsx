import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle } from "../firebase/auth";

const ContactModal = ({ open, handleClose }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(""); // filled only if logged in
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // ✅ Track login status
  useEffect(() => {
    if (open) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser(u);
          setName(u.displayName || "");
          setEmail(u.email || "");
        } else {
          setUser(null);
          setName("");
          setEmail("");
        }
      });
      return () => unsubscribe();
    }
  }, [open]);

  const handleLogin = async () => {
    const loggedInUser = await loginWithGoogle();
    if (loggedInUser) {
      setUser(loggedInUser);
      setName(loggedInUser.displayName || "");
      setEmail(loggedInUser.email || "");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setFeedback({
        type: "error",
        text: "You must be logged in to send a message.",
      });
      return;
    }

    if (!message.trim()) {
      setFeedback({ type: "error", text: "Message cannot be empty." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "https://sendcontactemail-3yomwio7xq-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        }
      );

      if (response.ok) {
        setFeedback({ type: "success", text: "Message sent successfully!" });
        setMessage(""); // keep name/email intact
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
        text: "Network error, please try again.",
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

        {!user ? (
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            Please login with Google to contact us.
          </Typography>
        ) : (
          <>
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
              fullWidth
              margin="normal"
              value={email}
              disabled
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        {!user ? (
          <Button onClick={handleLogin} color="secondary" variant="contained">
            Login with Google
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            color="secondary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
