import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function CallToAction() {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        background: "linear-gradient(135deg,#FF7A18,#FBC02D)",
        color: "#1f1300",
        textAlign: "center",
        borderRadius: 3,
        boxShadow: 4,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Join Mysurian Today!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, maxWidth: 640, mx: "auto" }}>
        Discover the best of Mysuru—from luxury stays to hidden food spots and
        cultural experiences. Explore like a local.
      </Typography>
      <Button
        variant="contained"
        sx={{
          bgcolor: "#1F1300",
          color: "white",
          borderRadius: 3,
          px: 4,
          py: 1.2,
          "&:hover": { bgcolor: "#2a1a06" },
        }}
        onClick={() => console.log("Get Started")}
      >
        Get Started
      </Button>
    </Box>
  );
}
