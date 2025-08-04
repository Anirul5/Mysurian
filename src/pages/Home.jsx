import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import SearchBar from "../components/SearchBar";
import QuickCategories from "../components/QuickCategories";
import FeaturedListings from '../components/FeaturedListings';
import LocalEvents from '../components/LocalEvents';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [preloadedItems, setPreloadedItems] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const categoriesList = [
    { name: "Hotels", category: "hotels", type: "category" },
    { name: "Gyms", category: "gyms", type: "category" },
    { name: "Restaurants", category: "restaurants", type: "category" },
    { name: "Events", category: "events", type: "category" }
  ];

  const categoryColors = {
    hotels: "primary",
    gyms: "success",
    restaurants: "warning",
    events: "secondary",
    default: "default"
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preload some featured/random items
  useEffect(() => {
    const fetchFeatured = async () => {
      const categories = ["hotels", "gyms", "restaurants", "events", "default"];
      let allData = [];

      for (let category of categories) {
        const snapshot = await getDocs(collection(db, category));
        let list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category,
          type: "listing"
        }));
        // Shuffle and take a few items
        list.sort(() => Math.random() - 0.5);
        allData = [...allData, ...list.slice(0, 3)];
      }
      setPreloadedItems(allData);
    };
    fetchFeatured();
  }, []);

  // Hybrid Search
  <SearchBar showDropdown={true} />

  const handleSelect = (item) => {
    if (item.type === "category") {
      navigate(`/${item.category}`);
    } else {
      navigate(`/${item.category}/${item.id}`);
    }
    setSearchTerm("");
    setResults([]);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Helmet>
        <title>Mysurian - Discover Mysuru Like Never Before</title>
        <meta
          name="description"
          content="Uncover the best places, events, and experiences in Mysuru with Mysurian. Explore hotels, restaurants, gyms, and more."
        />
      </Helmet>

      <Box textAlign="center" mb={5}>
        <Typography variant="h1" gutterBottom borderTop={2} borderColor="primary.main" pt={10} pb={2}>
          Discover Mysuru Like Never Before
        </Typography>
        <Typography variant="h6" color="text.secondary" pb={10}>
          Uncover the best places, experiences, and secrets of the city!
        </Typography>
      </Box>

      {/* Search Bar */}
      <Container maxWidth="md" sx={{ position: "relative" }} ref={dropdownRef}>
        <Box sx={{ mt: 5, mb: 5 }}>
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
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
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
                    alignItems: "center"
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ fontWeight: 500, fontSize: "1rem" }}
                    secondaryTypographyProps={{ fontSize: "0.85rem", color: "text.secondary" }}
                    primary={item.name}
                    secondary={
                      item.type === "category"
                        ? "Category"
                        : item.category.charAt(0).toUpperCase() + item.category.slice(1)
                    }
                  />
                  <Chip
                    label={
                      item.type === "category"
                        ? "Category"
                        : item.category.charAt(0).toUpperCase() + item.category.slice(1)
                    }
                    color={ item.type === "category"
                      ? "default"
                      : categoryColors[item.category] || "default"
                    }
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>

      {/* Sections */}
      <Container maxWidth="lg">
        <Box sx={{ mt: 10 }}>
          <QuickCategories onCategoryClick={(c) => console.log("Clicked:", c)} />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <Box sx={{ mt: 5 }}>
          <FeaturedListings />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <LocalEvents onEventClick={(e) => console.log("Event clicked:", e)} />
      </Container>
      <Container maxWidth="lg">
        <Box sx={{ mt: 5 }}>
          <Testimonials />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <Box sx={{ mt: 5 }}>
          <CallToAction />
        </Box>
      </Container>
    </Container>
  );
}
