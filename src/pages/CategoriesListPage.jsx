import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { categoryColors } from "../utils/categoryColors";

const formatCategoryName = (name) => {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const placeholderImage = "https://placehold.co/400x300?text=No+Image&font=roboto";

const CategoriesListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py:  5}}>
      <Typography variant="h4" align="center" gutterBottom>
        Browse Categories
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {categories.map((category) => {
  const {
    id,
    description = "Explore top listings under this category.",
    imageUrl = placeholderImage,
  } = category;

  const color = categoryColors[id] || categoryColors.default;
  const displayName = id ? formatCategoryName(id) : "Unnamed Category";

  return (
    <Grid item key={id || Math.random()}>
      <Card
        elevation={4}
        sx={{
          minWidth: { xs: 240, sm: 280 },
          maxWidth: 320,
          minHeight: 200,
          height: { xs: 280, sm: 300, md: 340 },
          borderTop: `6px solid`,
          borderColor: `${color}.main`,
          borderRadius: 3,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardActionArea onClick={() => navigate(`/category/${id}`)} sx={{ height: "100%" }}>
          <CardMedia
            component="img"
            height="140"
            image={imageUrl || placeholderImage}
            alt={displayName}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
})}

      </Grid>
    </Container>
  );
};

export default CategoriesListPage;
