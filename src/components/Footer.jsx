import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Button,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ContactModal from "./ContactModal"; // <-- import your modal

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{ width: "100%", backgroundColor: "#2c2c2c", color: "#fff", mt: 2 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Brand + About */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Mysurian
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "#ccc" }}>
              Your ultimate guide to discovering the best of Mysuru — from
              hotels and gyms to food spots and cultural events.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Quick Links
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link
                href={`/`}
                underline="none"
                sx={{ display: "block", color: "#ccc", mb: 0.5 }}
              >
                Home
              </Link>
              <Link
                href={`/categories`}
                underline="none"
                sx={{ display: "block", color: "#ccc", mb: 0.5 }}
              >
                Categories
              </Link>
              <Link
                href={`/`}
                underline="none"
                sx={{ display: "block", color: "#ccc", mb: 0.5 }}
              >
                Careers
              </Link>
            </Box>
          </Grid>

          {/* Contact + Socials */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Connect With Us
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <IconButton
                color="inherit"
                href="https://facebook.com"
                target="_blank"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                color="inherit"
                href="http://instagram.com.mysurian.in/"
                target="_blank"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://twitter.com"
                target="_blank"
              >
                <TwitterIcon />
              </IconButton>
            </Box>

            {/* Contact Us Button */}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ContactMailIcon />}
              sx={{ mt: 2, borderColor: "#aaa", color: "#ccc" }}
              onClick={() => setOpen(true)}
            >
              Contact Us
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* Copyright */}
      <Box sx={{ backgroundColor: "#1e1e1e", py: 2, textAlign: "center" }}>
        <Typography variant="body2" color="#aaa">
          © {new Date().getFullYear()} Mysurian. Made in Mysuru ❤️
        </Typography>
      </Box>

      {/* Contact Modal */}
      <ContactModal open={open} handleClose={() => setOpen(false)} />
    </Box>
  );
}
