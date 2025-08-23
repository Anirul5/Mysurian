import React, { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  collection,
  getDocs,
  increment,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
} from "@mui/material";

export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    address: "",
  });

  const itemsPerPage = 30;

  const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text
      ?.split(regex)
      .map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      );
  };

  // Get category list
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const catList = snapshot.docs.map((doc) => doc.id);
      setCategories(catList);
    };
    fetchCategories();
  }, []);

  // Fetch all results once
  useEffect(() => {
    if (!searchQuery || categories.length === 0) return;
    const fetchAllResults = async () => {
      setLoading(true);
      let allMatches = [];

      for (let category of categories) {
        const snapshot = await getDocs(collection(db, category));
        const matches = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data(), category }))
          .filter((item) =>
            Object.entries(item).some(([key, val]) => {
              if (typeof val === "string") {
                return val.toLowerCase().includes(searchQuery);
              }
              if (Array.isArray(val)) {
                return val.some(
                  (v) =>
                    typeof v === "string" &&
                    v.toLowerCase().includes(searchQuery)
                );
              }
              return false;
            })
          )
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));

        // Increment searchcount
        matches.forEach(async (match) => {
          try {
            await updateDoc(doc(db, category, match.id), {
              searchcount: increment(1),
            });
          } catch (err) {
            console.error("Error updating searchcount:", err);
          }
        });

        allMatches = [...allMatches, ...matches];
      }

      setResults(allMatches);
      setFilteredResults(allMatches);
      setLoading(false);
      setPage(1);
    };
    fetchAllResults();
  }, [searchQuery, categories]);

  // Apply filters in real-time
  useEffect(() => {
    let temp = results
      .filter((item) =>
        filters.category ? item.category === filters.category : true
      )
      .filter((item) =>
        filters.rating ? (item.rating || 0) >= Number(filters.rating) : true
      )
      .filter((item) =>
        filters.address
          ? item.address?.toLowerCase().includes(filters.address.toLowerCase())
          : true
      );
    setFilteredResults(temp);
    setPage(1);
  }, [filters, results]);

  // Pagination handler
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedResults = filteredResults.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const ratingOptions = [1, 2, 3, 4];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Search Results for "{searchQuery}"
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.replaceAll("_", " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel variant="standard" htmlFor="uncontrolled-native">
            Min Rating
          </InputLabel>
          <Select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            {ratingOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {r}+
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={20} />
            </Grid>
          ))}
        </Grid>
      ) : paginatedResults.length === 0 ? (
        <Typography>No results found.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedResults.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  component={RouterLink}
                  to={`/${item.category}/${item.id}`}
                  sx={{
                    textDecoration: "none",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 3,
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-4px)",
                      transition: "0.3s",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      item.image ||
                      "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {highlightText(item.name, searchQuery)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {highlightText(
                        item.description?.slice(0, 80) + "...",
                        searchQuery
                      )}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={
                          item.category
                            ?.replaceAll("_", " ")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ") || "Uncategorized"
                        }
                        color="secondary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {item.rating && (
                        <Chip
                          label={`Rating: ${item.rating}`}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredResults.length > itemsPerPage && (
            <Box display="flex" justifyContent="center" mt={4} mb={2}>
              <Pagination
                count={Math.ceil(filteredResults.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="secondary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
