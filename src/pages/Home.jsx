import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import SearchBar from "../components/SearchBar";
import QuickCategories from "../components/QuickCategories";
import FeaturedTopics from "../components/FeaturedTopics";
import FeaturedListings from "../components/FeaturedListings";
import EyesAreLookingAt from "../components/EyesAreLookingAt";
import CallToAction from "../components/CallToAction";
import { Helmet } from "react-helmet-async";
import heroImage from "../assets/hero_mysuru.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <Helmet>
        <title>Mysurian - Discover Mysuru Like Never Before</title>
      </Helmet>

      {/* HERO SECTION */}
      <Box
        sx={{
          color: "white",
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          backgroundImage: `linear-gradient(
        rgba(0,0,0,0.6),   /* top: semi-transparent black */
        rgba(0,0,0,0.3)    /* bottom: lighter */
      ),url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2 }}
          >
            Discover Mysuru Like Never Before
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>
            Uncover the best places, experiences, and secrets of the city!
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/categories`)}
            sx={{
              bgcolor: "#fff",
              color: "#B13D00",
              fontWeight: "bold",
              borderRadius: "30px",
              px: 3,
              "&:hover": { bgcolor: "#ffe6d7" },
            }}
          >
            Start Exploring
          </Button>

          <Box sx={{ mt: 4 }}>
            <SearchBar placeholder="Search categories or places..." />
          </Box>
        </Container>
      </Box>

      {/* FLOATING CATEGORIES */}
      <Container
        maxWidth="lg"
        sx={{
          mt: -6,
          mb: 6,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: "#ffeede",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            p: 3,
          }}
        >
          <QuickCategories />
        </Box>
      </Container>

      {/* FEATURED SECTION */}
      <Box sx={{ bgcolor: "#1F1300", color: "white", pt: 12, pb: 6 }}>
        <Container
          maxWidth="lg"
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Featured Topics
          </Typography>
          <FeaturedTopics />
        </Container>
      </Box>

      {/* LISTINGS */}
      <Container
        maxWidth="lg"
        sx={{ py: 8, textAlign: { xs: "center", md: "left" } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Featured Listings
        </Typography>
        <FeaturedListings />
      </Container>

      {/* TRENDING */}
      <Box
        sx={{
          bgcolor: "#FFF7F0",
          py: 8,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Eyes Are Looking At
          </Typography>
          <EyesAreLookingAt />
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <CallToAction />
      </Container>
    </Box>
  );
}
