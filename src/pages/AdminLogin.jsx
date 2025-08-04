// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="button" fontWeight="bold" gutterBottom>            
            Admin Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              outline="none"
              borderRadius={5}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="standard"
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.2, borderRadius: 5 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
