import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { categoryColors } from "../utils/categoryColors";
import { logSearch } from "../utils/logSearch";

function SearchBar({
  placeholder = "Search categories or places...",
  showDropdown = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [preloadedItems, setPreloadedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const catList = snapshot.docs.map((doc) => doc.id);
      setCategories(["all", ...catList]);
    };
    fetchCategories();
  }, []);

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

  useEffect(() => {
    if (!showDropdown) return;
    const fetchFeatured = async () => {
      let allData = [];
      const categoriesToUse =
        selectedCategory === "all" ? categories.slice(1) : [selectedCategory];
      for (let category of categoriesToUse) {
        const snapshot = await getDocs(collection(db, category));
        let list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          category,
          type: "listing",
        }));
        list.sort(() => Math.random() - 0.5);
        allData = [...allData, ...list.slice(0, 3)];
      }
      setPreloadedItems(allData);
    };
    fetchFeatured();
  }, [showDropdown, selectedCategory, categories]);

  useEffect(() => {
    if (!showDropdown || !searchTerm) {
      setResults([]);
      return;
    }

    const matchedPreloaded = preloadedItems.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string") {
          return val.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (Array.isArray(val)) {
          return val.some(
            (v) =>
              typeof v === "string" &&
              v.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return false;
      })
    );

    if (searchTerm.length > 2) {
      const fetchLazyResults = async () => {
        const categoriesToUse =
          selectedCategory === "all" ? categories.slice(1) : [selectedCategory];
        let allMatches = [];
        for (let category of categoriesToUse) {
          const snapshot = await getDocs(collection(db, category));
          const matches = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              category,
              type: "listing",
            }))
            .filter((item) =>
              Object.entries(item).some(([key, val]) => {
                if (typeof val === "string") {
                  return val.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (Array.isArray(val)) {
                  return val.some(
                    (v) =>
                      typeof v === "string" &&
                      v.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                }
                return false;
              })
            );
          allMatches = [...allMatches, ...matches];
        }

        const combined = [...matchedPreloaded, ...allMatches];
        const unique = combined.filter(
          (v, i, a) =>
            a.findIndex(
              (t) =>
                t.id === v.id && t.category === v.category && t.type === v.type
            ) === i
        );
        setResults(unique);
      };
      fetchLazyResults();
    } else {
      setResults(matchedPreloaded);
    }
  }, [searchTerm, preloadedItems, showDropdown, selectedCategory, categories]);

  const handleSelect = (item) => {
    if (item.type === "category") {
      navigate(`/${item.category}`);
    } else {
      navigate(`/${item.category}/${item.id}`);
    }
    setSearchTerm("");
    setResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      await logSearch(searchTerm.trim(), selectedCategory);
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <Stack
        direction="row"
        spacing={1}
        mb={1}
        flexWrap="wrap"
        sx={{ display: { xs: "none", sm: "none", md: "block" } }}
      >
        {categories.map((cat) => (
          <Chip
            mb={1}
            key={cat
              .replaceAll("_", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            label={cat
              .replaceAll("_", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            onClick={() => setSelectedCategory(cat)}
            color={selectedCategory === cat ? "secondary" : "default"}
          />
        ))}
      </Stack>
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
                }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={item.category
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                />
                <Chip
                  label={item.category
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  color={categoryColors[item.category] || "default"}
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
