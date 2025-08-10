import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  InputAdornment,
  Container,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { categoryColors } from "../utils/categoryColors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const fallbackImage = "/fallback.jpg"; // Replace with your fallback path

const CategoryPage = () => {
  const navigate = useNavigate();
  const { categoryName, categoryId, category } = useParams();
  const [allListings, setAllListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get category image
        const categoryDoc = await getDoc(
          doc(db, "categories", categoryId || categoryName)
        );
        if (categoryDoc.exists()) {
          setCategoryImage(categoryDoc.data().imageForCategory || "");
        }

        // Get listings
        const querySnapshot = await getDocs(collection(db, categoryName));
        const listings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllListings(listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [categoryName, categoryId]);

  const filteredListings = allListings.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColor = categoryColors[categoryName] || categoryColors.default;

  const getListingImage = (listing) => {
    if (
      typeof listing.imageUrl === "string" &&
      listing.imageUrl.trim() !== ""
    ) {
      return listing.imageUrl;
    }
    if (Array.isArray(listing.gallery) && listing.gallery.length > 0) {
      return listing.gallery[0];
    }
    if (categoryImage) {
      return categoryImage;
    }
    return fallbackImage;
  };

  return (
    <Container maxWidth="lg">
      <Box
        mt={4}
        mb={3}
        justifyContent={"center"}
        textAlign="center"
        sx={{ width: "80%", justifySelf: "center" }}
      >
        <Box
          mb={2}
          sx={{
            display: "flex",
            width: "100%",
            justifySelf: "center",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={() => navigate(`/categories`)}
          >
            Back
          </Button>
          <Typography
            variant="h4"
            textTransform="capitalize"
            style={{ fontSize: "clamp(1rem, 2vw, 2.5rem)", width: "100%" }}
          >
            {categoryName
              .replaceAll("_", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Typography>
        </Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="secondary" />
              </InputAdornment>
            ),
            sx: { borderRadius: "50px", backgroundColor: "#fff" },
          }}
        />
      </Box>

      <Grid container spacing={3} justifyContent={"center"}>
        {filteredListings.length === 0 ? (
          <Grid item xs={12}>
            <Chip label={"No listings found"} color={"warning"} size="large" />
          </Grid>
        ) : (
          filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id}>
              <Link
                to={`/${categoryName}/${listing.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={{
                    minWidth: { xs: 240, sm: 280 },
                    maxWidth: 320,
                    minHeight: 350,
                    height: { xs: 280, sm: 300, md: 340 },
                    display: "flex",
                    flexDirection: "column",
                    borderTop: `6px solid`,
                    borderColor: `${categoryColor}.main`,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                    mx: "auto",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={getListingImage(listing)}
                    alt={listing.name || "Listing image"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = categoryImage || fallbackImage;
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 600 }}
                      >
                        {listing.name}
                      </Typography>
                      <Chip
                        label={categoryName
                          .replaceAll("_", " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                        color={categoryColor}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" mb={1} color="text.secondary">
                      {listing.description
                        ? listing.description.slice(0, 100) + "..."
                        : "No description provided."}
                    </Typography>

                    <Box display={"flex"} justifyContent={"space-between"}>
                      {listing.rating && (
                        <Rating
                          name="read-only"
                          value={parseFloat(listing.rating)}
                          precision={0.5}
                          size="small"
                          readOnly
                        />
                      )}

                      {listing.date && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(listing.date).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default CategoryPage;
