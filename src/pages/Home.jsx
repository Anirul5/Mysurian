import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Skeleton,
} from "@mui/material";
import SearchBar from "../components/SearchBar";
import QuickCategories from "../components/QuickCategories";
import FeaturedListings from "../components/FeaturedListings";
import CallToAction from "../components/CallToAction";
import { Helmet } from "react-helmet-async";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import FeaturedTopics from "../components/FeaturedTopics";
import EyesAreLookingAt from "../components/EyesAreLookingAt";
import HomePageSkeleton from "../components/HomePageSkeleton";
// Local optimized hero image
import heroImage from "../assets/hero_mysuru.png"; // Save optimized jpg/webp in assets
import { useHomeData } from "../context/HomeDataContext";
import FullScreenLoader from "../context/HomeDataContext";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [preloadedItems, setPreloadedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const categoryColors = {
    hotels: "primary",
    gyms: "success",
    restaurants: "warning",
    events: "secondary",
    default: "default",
  };
  const { data, loading } = useHomeData();
  const [loadings, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    // Simulate API or image loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate hero image load
  useEffect(() => {
    const img = new Image();
    img.src = heroImage;
    img.onload = () => setLoadingHero(false);
  }, []);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const categoryList = snapshot.docs.map((doc) => ({
        name: doc.data().name,
        category: doc.id,
        type: "category",
      }));
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  // Fetch featured listings
  useEffect(() => {
    const fetchFeatured = async () => {
      const snapshot = await getDocs(collection(db, "featured"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "listing",
      }));
      setPreloadedItems(list);
    };
    fetchFeatured();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const eventList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    };
    fetchEvents();
  }, []);

  const handleSelect = (item) => {
    if (item.type === "category") {
      navigate(`/${item.category}`);
    } else {
      navigate(`/${item.category}/${item.id}`);
    }
    setSearchTerm("");
    setResults([]);
  };

  if (loading) return <HomePageSkeleton />;

  // if (loadings) return <FullScreenLoader />;

  return (
    <Container
      sx={{
        mt: 0,
        px: 0,
        maxWidth: "100% !important",
        padding: "0 !important",
      }}
    >
      <Helmet>
        <title>Mysurian - Discover Mysuru Like Never Before</title>
        <meta
          name="description"
          content="Uncover the best places, events, and experiences in Mysuru with Mysurian. Explore hotels, restaurants, gyms, and more."
        />
      </Helmet>
      {/* HERO SECTION */}
      <Box
        sx={{
          height: { xs: 300, md: 450 },
          backgroundImage: `url(${heroImage})`,

          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
        }}
      >
        {loadingHero ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ bgcolor: "grey.300" }}
          />
        ) : (
          <Container>
            <Typography
              variant="h2"
              sx={{
                display: "block",
                mt: 5,
                p: 2,
                textShadow: "11px 8px 16px #0000008f",
              }}
            >
              Discover Mysuru Like Never Before
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textShadow: "11px 8px 16px #0000008f",
              }}
            >
              Uncover the best places, experiences, and secrets of the city!
            </Typography>
            {/* Search Bar */}
            <Container
              maxWidth="md"
              sx={{ position: "relative", mt: 5 }}
              ref={dropdownRef}
            >
              <Box sx={{ mb: 5, pb: 3 }}>
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories or places..."
                />
              </Box>
              {results.length > 0 && (
                <Paper
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    mt: 1,
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <List disablePadding>
                    {results.map((item, idx) => (
                      <ListItem
                        button
                        key={idx}
                        onClick={() => handleSelect(item)}
                        sx={{
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                          px: 2,
                          py: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ListItemText
                          primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: "1rem",
                          }}
                          secondaryTypographyProps={{
                            fontSize: "0.85rem",
                            color: "text.secondary",
                          }}
                          primary={item.name}
                          secondary={
                            item.type === "category"
                              ? "Category"
                              : item.category
                          }
                        />
                        <Chip
                          label={
                            item.type === "category"
                              ? "Category"
                              : item.category
                          }
                          color={categoryColors[item.category] || "default"}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Container>
          </Container>
        )}
      </Box>

      {loading ? (
        HomePageSkeleton
      ) : (
        <>
          {/* Dynamic Sections */}
          <Container maxWidth="lg">
            <QuickCategories />
          </Container>

          <Container maxWidth="lg">
            <FeaturedTopics />
          </Container>

          <Container maxWidth="lg">
            <FeaturedListings />
          </Container>

          <Container maxWidth="lg">
            <EyesAreLookingAt />
          </Container>
        </>
      )}

      <Container maxWidth="lg">
        <Box sx={{ mt: 5 }}>
          <CallToAction />
        </Box>
      </Container>
    </Container>
  );
}
