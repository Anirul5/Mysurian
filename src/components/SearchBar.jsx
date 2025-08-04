import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

function SearchBar({ placeholder = "Search categories or places...", showDropdown = true }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [preloadedItems, setPreloadedItems] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const categoriesList = [
    { name: "Hotel", category: "hotels", type: "category" },
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
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Preload for dropdown
  useEffect(() => {
    if (!showDropdown) return;
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
        list.sort(() => Math.random() - 0.5);
        allData = [...allData, ...list.slice(0, 3)];
      }
      setPreloadedItems(allData);
    };
    fetchFeatured();
  }, [showDropdown]);

  // Search logic
  useEffect(() => {
    if (!showDropdown) return;

    if (!searchTerm) {
      setResults([]);
      return;
    }

    const matchedCategories = categoriesList.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchedPreloaded = preloadedItems.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setResults([...matchedCategories, ...matchedPreloaded]);

    if (searchTerm.length > 2) {
      const fetchLazyResults = async () => {
        const categories = ["hotels", "gyms", "restaurants", "events", "default"];
        let allMatches = [];

        for (let category of categories) {
          const snapshot = await getDocs(collection(db, category));
          const matches = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data(), category, type: "listing" }))
            .filter(item =>
              item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          allMatches = [...allMatches, ...matches];
        }

        const combined = [...matchedCategories, ...allMatches];
        const unique = combined.filter(
          (v, i, a) =>
            a.findIndex(t => (t.id === v.id && t.category === v.category && t.type === v.type)) === i
        );
        setResults(unique);
      };
      fetchLazyResults();
    }
  }, [searchTerm, preloadedItems, showDropdown]);

  const handleSelect = (item) => {
    if (item.type === "category") {
      navigate(`/${item.category}`);
    } else {
      navigate(`/${item.category}/${item.id}`);
    }
    setSearchTerm("");
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="secondary" />
              </InputAdornment>
            ),
            sx: { borderRadius: "50px", backgroundColor: "#fff" },
          }}
        />
      </form>

      {showDropdown && results.length > 0 && (
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
                  color={
                    item.type === "category"
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
    </div>
  );
}

export default SearchBar;
