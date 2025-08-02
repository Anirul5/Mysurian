import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function CallToAction() {
  return (
    <Box
      sx={{
        mt: 10,
        py: 5,
        px: 3,
        background: "linear-gradient(135deg, #6A1B9A, #FBC02D)",
        color: "#fff",
        textAlign: "center",
        borderRadius: "16px",
        boxShadow: 4,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        Join Mysurian Today!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
        Discover the best of Mysuru — from luxury hotels to hidden food spots, fitness centers, and cultural events. Stay updated and explore like a local.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        sx={{
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          borderRadius: "50px",
        }}
        onClick={() => console.log("Sign Up Clicked")}
      >
        Get Started
      </Button>
    </Box>
  );
}
