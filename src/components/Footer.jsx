import React from "react";
import { Box, Container, Grid, Typography, Link, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

export default function Footer() {
  return (
    <Box sx={{  width: "100%", backgroundColor: "#2c2c2c", color: "#fff", mt: 10 }}>
      {/* Top Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Logo & Description */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Mysurian
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "#ccc" }}>
              Your ultimate guide to discovering the best of Mysuru —
              from hotels and gyms to food spots and cultural events.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Quick Links
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link href="#" underline="none" sx={{ display: "block", color: "#ccc", mb: 0.5 }}>
                Hotels
              </Link>
              <Link href="#" underline="none" sx={{ display: "block", color: "#ccc", mb: 0.5 }}>
                Gyms
              </Link>
              <Link href="#" underline="none" sx={{ display: "block", color: "#ccc", mb: 0.5 }}>
                Food
              </Link>
              <Link href="#" underline="none" sx={{ display: "block", color: "#ccc" }}>
                Events
              </Link>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Follow Us
            </Typography>
            <Box sx={{ mt: 1 }}>
              <IconButton color="inherit" href="https://facebook.com" target="_blank">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" href="https://instagram.com" target="_blank">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" href="https://twitter.com" target="_blank">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box sx={{ backgroundColor: "#1e1e1e", py: 2, textAlign: "center" }}>
        <Typography variant="body2" color="#aaa">
          © {new Date().getFullYear()} Mysurian. Made in Mysuru ❤️
        </Typography>
      </Box>
    </Box>
  );
}
