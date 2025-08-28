import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Careers() {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", mt: 10 }}>
      <Box>
        <Typography variant="h2" gutterBottom>
          Mysurian Careers
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No positions are open at this time. Please check back later for career
          opportunities.
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
