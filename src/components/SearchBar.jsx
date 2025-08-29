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
                <SearchIcon sx={{ color: "#f5b625" }} /> {/* gold accent */}
              </InputAdornment>
            ),
            sx: {
              borderRadius: "50px",
              backgroundColor: "rgba(255,255,255,0.15)", // frosted white
              backdropFilter: "blur(10px)", // glass blur
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)", // faint border
              color: "white", // text color
              "& input": {
                color: "white", // input text color
                fontWeight: 500,
                "::placeholder": {
                  color: "rgba(255,255,255,0.8)", // lighter placeholder
                  opacity: 1,
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // remove default outline
              },
            },
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
            // 🔥 glassy look
            bgcolor: "rgba(73, 72, 72, 0.73)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            color: "white",
            maxHeight: 500,
            overflow: "auto",

            // 👇 Custom scrollbar
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.25)",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.3)",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(255,255,255,0.4)",
            },

            // Firefox
            scrollbarWidth: "thin",
            scrollbarColor: "#f5b625 transparent",
          }}
        >
          <List disablePadding>
            {results.map((item, idx) => (
              <ListItem
                button
                key={idx}
                onClick={() => handleSelect(item)}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)", // subtle glass hover
                  },
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
                  primaryTypographyProps={{
                    sx: { color: "white", fontWeight: 600 },
                  }}
                  secondaryTypographyProps={{
                    sx: { color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" },
                  }}
                />
                <Chip
                  label={item.category
                    .replaceAll("_", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  sx={{
                    bgcolor: "rgba(245,182,37,0.15)", // gold accent transparent
                    color: "#f5b625",
                    border: "1px solid rgba(245,182,37,0.4)",
                    fontWeight: 600,
                  }}
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
