import React, { useRef, useState, useEffect } from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import SearchBar from "../components/SearchBar";
import QuickCategories from "../components/QuickCategories";
import FeaturedTopics from "../components/FeaturedTopics";
import FeaturedListings from "../components/FeaturedListings";
import EyesAreLookingAt from "../components/EyesAreLookingAt";
import { Helmet } from "react-helmet-async";
import heroImage from "../assets/hero_mysuru.png";
import { useNavigate } from "react-router-dom";
import HeroHighlights from "../components/HeroHighlights";

export default function Home() {
  const navigate = useNavigate();

  // --- Horizontal Scroll with fade, arrows, dots ---
  const HorizontalScroll = ({ children, bgColor = "#fff" }) => {
    const containerRef = useRef(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollMax, setScrollMax] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      setScrollLeft(el.scrollLeft);
      setScrollMax(el.scrollWidth - el.clientWidth);
      const page = Math.round(el.scrollLeft / el.clientWidth);
      setCurrentPage(page);
      setTotalPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth)));
    };

    useEffect(() => {
      handleScroll();
      const el = containerRef.current;
      if (!el) return;
      el.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
      return () => {
        el.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, []);

    const scrollByPage = (dir) => {
      const el = containerRef.current;
      if (!el) return;
      const width = el.clientWidth;
      const newScroll = el.scrollLeft + dir * width;
      el.scrollTo({ left: newScroll, behavior: "smooth" });
    };

    return (
      <Box sx={{ position: "relative" }}>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            px: { xs: 1, md: 0 },
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
            paddingTop: "10px",
          }}
        >
          {children}

          {/* Right fade */}
          {scrollLeft < scrollMax && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: -2,
                width: "60px",
                height: "100%",
                pointerEvents: "none",
                background: `linear-gradient(to right, transparent, ${bgColor})`,
              }}
            />
          )}
        </Box>

        {/* Dots */}
        {totalPages > 1 && (
          <Stack direction="row" justifyContent="center" mt={2}>
            {Array.from({ length: totalPages - 1 }).map((_, index) => (
              <Box
                key={index}
                onClick={() => {
                  if (containerRef.current) {
                    const scrollX = index * containerRef.current.clientWidth;
                    containerRef.current.scrollTo({
                      left: scrollX,
                      behavior: "smooth",
                    });
                  }
                }}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor:
                    index === currentPage ? "#f5b625" : "rgba(255, 0, 0, 0.4)",
                  mx: 0.5,
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#fff" }}>
      <Helmet>
        <title>Mysurian - Discover Mysuru Like Never Before</title>
      </Helmet>

      {/* HERO */}
      <Box
        sx={{
          color: "white",
          pt: { xs: 10, md: 14 },
          pb: { xs: 12, md: 18 },
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          textAlign: "center",
          height: "300px",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2 }}
          >
            Discover Mysuru Like Never Before
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, mb: 4 }}>
            Uncover the best places, experiences, and secrets of the city!
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              borderRadius: 999,
              px: 2,
              py: 1,
              mb: 3,
            }}
          >
            <SearchBar placeholder="Search categories or places..." />
          </Box>

          {/* CTA Button BELOW search */}
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/categories`)}
            sx={{
              bgcolor: "#f5b625",
              color: "#f3f0f0ff",
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              py: 1.5,
              textTransform: "none",
              "&:hover": { bgcolor: "#ffcd42" },
            }}
          >
            Start Exploring
          </Button>
        </Container>
      </Box>

      {/* HERO HIGHLIGHTS */}
      <Box sx={{ pt: { xs: 4, md: 6 }, pb: 0 }}>
        <HeroHighlights />
      </Box>

      {/* QUICK CATEGORIES */}
      <Box
        sx={{
          bgcolor: "#ffeede",
          borderRadius: 0,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          p: { xs: 2, sm: 3 },
          backdropFilter: "blur(6px)",
        }}
      >
        <HorizontalScroll bgColor="#FFF7F0">
          <QuickCategories />
        </HorizontalScroll>
      </Box>

      {/* FEATURED TOPICS */}
      <Box
        sx={{
          bgcolor: "#1F1300",
          color: "white",
          py: { xs: "25px", md: "35px" },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Featured Topics
          </Typography>
          <HorizontalScroll bgColor="#1F1300">
            <FeaturedTopics />
          </HorizontalScroll>
        </Container>
      </Box>

      {/* FEATURED LISTINGS */}
      <Container maxWidth="lg" sx={{ py: { xs: "25px", md: "35px" } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Featured Listings
        </Typography>
        <HorizontalScroll bgColor="#fff">
          <FeaturedListings />
        </HorizontalScroll>
      </Container>

      {/* Eyes Are Looking At */}
      <Box sx={{ bgcolor: "#FFF7F0", py: { xs: "25px", md: "35px" } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Eyes Are Looking At
          </Typography>
          <HorizontalScroll bgColor="#FFF7F0">
            <EyesAreLookingAt />
          </HorizontalScroll>
        </Container>
      </Box>
    </Box>
  );
}
