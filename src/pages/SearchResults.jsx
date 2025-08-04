import React, { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Container, Typography, Grid, Card, CardMedia, CardContent, Skeleton } from "@mui/material";

const keywordCategoryMap = {
  hotel: ["hotels", "restaurants"],
  stay: ["hotels"],
  restaurant: ["restaurants", "hotels"],
  resto: ["restaurants", "hotels"],
  food: ["restaurants", "events"],
  gym: ["gyms"],
  fitness: ["gyms"]
};

export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchResults = async () => {
      setLoading(true);

      // Determine categories to search
      let categoriesToSearch = ["hotels", "gyms", "restaurants", "events"];
      for (const keyword in keywordCategoryMap) {
        if (searchQuery.includes(keyword)) {
          categoriesToSearch = Array.from(new Set([...categoriesToSearch, ...keywordCategoryMap[keyword]]));
        }
      }

      let allMatches = [];
      for (let category of categoriesToSearch) {
        const snapshot = await getDocs(collection(db, category));
        const matches = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data(), category }))
          .filter(item => {
            const fieldsToCheck = [
              item.name,
              item.description,
              Array.isArray(item.keywords) ? item.keywords.join(" ") : item.keywords,
              item.address
            ];
            return fieldsToCheck.some(field =>
              field?.toLowerCase().includes(searchQuery)
            );
          });
        allMatches = [...allMatches, ...matches];
      }

      setResults(allMatches);
      setLoading(false);
    };

    fetchResults();
  }, [searchQuery]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Search Results for "{searchQuery}"
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} minWidth="200px" minHeight="120px">
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }}  minWidth="120px" minHeight="120px"/>
              <Skeleton variant="text" width="80%" height={30} minWidth="120px" />
              <Skeleton variant="text" width="60%" height={20} minWidth="100px" />
            </Grid>
          ))}
        </Grid>
      ) : results.length === 0 ? (
        <Typography>No results found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {results.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card component={RouterLink} to={`/${item.category}/${item.id}`} sx={{ textDecoration: "none" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image || "https://via.placeholder.com/300x200"}
                  alt={item.name}
                />
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}



