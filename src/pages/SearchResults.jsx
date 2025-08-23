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
  CardActionArea,
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
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

const StyledCard = styled("div")(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#ffeede",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[6],
  },
  [theme.breakpoints.down("sm")]: {
    transform: "none", // disable hover shift on mobile
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  "& .MuiInputBase-root": {
    borderRadius: "50px",
    backgroundColor: "#fff",
    "&.Mui-focused": {
      borderColor: theme.palette.grey[400], // Subtle border on focus
      boxShadow: `0 0 0 2px ${theme.palette.grey[200]}`,
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "50px",
    backgroundColor: "#fff",
    "&.Mui-focused": {
      borderColor: theme.palette.grey[400], // Subtle border on focus
      boxShadow: `0 0 0 2px ${theme.palette.grey[200]}`,
    },
  },
}));

const fallbackImage =
  "https://images.unsplash.com/photo-1618598827591-696673ab0abe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginatedResults = filteredResults.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const ratingOptions = [1, 2, 3, 4];

  return (
    <Container sx={{ py: { xs: 2, sm: 2 }, px: { xs: 1, sm: 2 } }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 4,
          fontSize: { xs: "1.5rem", sm: "2rem" },
          fontWeight: "medium",
        }}
      >
        Search Results for "{searchQuery}"
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <StyledFormControl>
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
        </StyledFormControl>

        <StyledFormControl>
          <InputLabel>Min Rating</InputLabel>
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
        </StyledFormControl>

        <StyledTextField
          label="Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="secondary" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {loading ? (
        <Grid container spacing={2} justifyContent="center">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={idx}
              sx={{ display: "flex", width: { xs: "80%", sm: 220 } }}
            >
              <StyledCard>
                <Skeleton
                  variant="rectangular"
                  width="200px"
                  height={160}
                  animation="wave"
                />
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Skeleton
                    variant="text"
                    height={30}
                    sx={{ mb: 1 }}
                    animation="wave"
                  />
                  <Skeleton variant="text" height={20} animation="wave" />
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : paginatedResults.length === 0 ? (
        <Box display="flex" justifyContent="center">
          <Chip label="No results found" color="warning" size="large" />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} justifyContent="center">
            {paginatedResults.map((item, index) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                lg={2}
                key={index}
                sx={{ display: "flex", width: { xs: "80%", sm: 220 } }}
              >
                <RouterLink
                  to={`/${item.category}/${item.id}`}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <StyledCard>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        sx={{
                          height: { xs: 120, sm: 140, md: 160 },
                          objectFit: "cover",
                          backgroundColor: "grey.100",
                        }}
                        image={item.image || fallbackImage}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                      />
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1 }}>
                        <Typography
                          title={item.name}
                          sx={{
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                              lg: "1.2rem",
                            },
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "black",
                          }}
                        >
                          {highlightText(item.name, searchQuery)}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.85rem",
                              md: "0.9rem",
                            },
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {highlightText(
                            item.description?.slice(0, 80) + "...",
                            searchQuery
                          )}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
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
                    </CardActionArea>
                  </StyledCard>
                </RouterLink>
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
