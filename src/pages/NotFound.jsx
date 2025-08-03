import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", mt: 10 }}>
      <Box>
        <Typography variant="h2" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, borderRadius: 3 }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
