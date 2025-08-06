import React, { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
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
  Box
} from "@mui/material";

export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Get all category IDs from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const catList = snapshot.docs.map((doc) => doc.id);
      setCategories(catList);
    };
    fetchCategories();
  }, []);

  // 🔍 Fetch search results across all dynamic categories
  useEffect(() => {
    if (!searchQuery || categories.length === 0) return;

    const fetchResults = async () => {
      setLoading(true);
      let allMatches = [];

      for (let category of categories) {
        const snapshot = await getDocs(collection(db, category));
        const matches = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data(), category }))
          .filter((item) =>
            Object.entries(item).some(([key, val]) => {
              if (typeof val === "string") {
                return val.toLowerCase().includes(searchQuery);
              }
              if (Array.isArray(val)) {
                return val.some(
                  (v) => typeof v === "string" && v.toLowerCase().includes(searchQuery)
                );
              }
              return false;
            })
          );
        allMatches = [...allMatches, ...matches];
      }

      setResults(allMatches);
      setLoading(false);
    };

    fetchResults();
  }, [searchQuery, categories]);

  return (
    <Container sx={{ mt: 4, justifyItems: "center" }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Search Results for "{searchQuery}"
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx} minWidth={240}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} minWidth={240} />
              <Skeleton variant="text" height={30} minWidth={240} />
              <Skeleton variant="text" height={20} minWidth={240} />
            </Grid>
          ))}
        </Grid>
      ) : results.length === 0 ? (
        <Typography>No results found.</Typography>
      ) : (
        <Grid container spacing={2}>
    <Container maxWidth="lg" sx={{ py: 4 }}>
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "1fr 1fr",
        md: "1fr 1fr 1fr",
        lg: "1fr 1fr 1fr 1fr"
      },
      gap: 2,
    }}
  >
    {results.map((item, index) => (
      <Card
        key={index}
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
          '&:hover': {
            boxShadow: 6,
            transform: "translateY(-4px)",
            transition: "0.3s"
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={item.image || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={item.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.description?.slice(0, 80)}...
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, flexWrap: "wrap" }}>
            <Chip
              label={
                item.category
                  ?.replaceAll("_", " ")
                  .split(" ")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ") || "Uncategorized"
              }
              color="secondary"
              size="small"
              sx={{ mb: 1 }}
            />
            {item.date && (
              <Chip
                label={`Uploaded: ${item.date}`}
                size="small"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
</Container>

  
</Grid>

      )}
    </Container>
  );
}
