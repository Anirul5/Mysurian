import React, { useEffect, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
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
  Button,
} from "@mui/material";

export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState({});
  const [hasMore, setHasMore] = useState(false);

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

  // Fetch results with server-side pagination
  useEffect(() => {
    if (!searchQuery || categories.length === 0) return;
    fetchResults(1);
    // eslint-disable-next-line
  }, [searchQuery, categories]);

  const fetchResults = async (pageNumber) => {
    setLoading(true);
    let allMatches = [];
    let lastDocMap = {};
    let moreData = false;

    for (let category of categories) {
      let qRef;
      if (pageNumber === 1) {
        qRef = query(
          collection(db, category),
          orderBy("rating", "desc"),
          limit(16)
        );
      } else {
        const lastDocSnap = lastDocs[category];
        if (!lastDocSnap) continue;
        qRef = query(
          collection(db, category),
          orderBy("rating", "desc"),
          startAfter(lastDocSnap),
          limit(16)
        );
      }

      const snapshot = await getDocs(qRef);

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
                  typeof v === "string" && v.toLowerCase().includes(searchQuery)
              );
            }
            return false;
          })
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      // store last visible doc for pagination
      if (!snapshot.empty) {
        lastDocMap[category] = snapshot.docs[snapshot.docs.length - 1];
      }

      if (snapshot.size === 16) {
        moreData = true;
      }

      allMatches = [...allMatches, ...matches];

      // 🔄 Increment searchcount for matched items
      matches.forEach(async (match) => {
        try {
          await updateDoc(doc(db, category, match.id), {
            searchcount: increment(1),
          });
        } catch (err) {
          console.error("Error updating searchcount:", err);
        }
      });
    }

    setResults(allMatches);
    setLastDocs((prev) => ({ ...prev, ...lastDocMap }));
    setHasMore(moreData);
    setPage(pageNumber);
    setLoading(false);
  };

  return (
    <Container sx={{ mt: 4, justifyItems: "center" }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Search Results for "{searchQuery}"
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx} minWidth={240}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
                minWidth={240}
              />
              <Skeleton variant="text" height={30} minWidth={240} />
              <Skeleton variant="text" height={20} minWidth={240} />
            </Grid>
          ))}
        </Grid>
      ) : results.length === 0 ? (
        <Typography>No results found.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                    lg: "1fr 1fr 1fr 1fr",
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
                        {/* {item.date && (
                          <Chip
                            label={`Uploaded: ${item.date}`}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        )} */}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Container>
          </Grid>

          {/* Pagination Buttons */}
          {results.length > 16 ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}
            >
              <Button
                variant="outlined"
                disabled={page === 1}
                onClick={() => fetchResults(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled={!hasMore}
                onClick={() => fetchResults(page + 1)}
              >
                Next
              </Button>
            </Box>
          ) : (
            <></>
          )}
        </>
      )}
    </Container>
  );
}
