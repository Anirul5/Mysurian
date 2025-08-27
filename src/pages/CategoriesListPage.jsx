import React, { useEffect, useState, Suspense } from "react";
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
  Button,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";

// Styled components for consistent theming
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
  [theme.breakpoints.down("sm")]: {
    transform: "none", // Prevent hover effect on mobile
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500,
  padding: theme.spacing(1, 2),
}));

const formatCategoryName = (name) => {
  return name
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const placeholderImage =
  "https://images.unsplash.com/photo-1579429223126-29d2f6f9c1ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container
      sx={{
        py: { xs: 2, sm: 0 },
        px: { xs: 1, sm: 2 },
      }}
    >
      {/* Header + Back button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, sm: 4 },
          flexWrap: "wrap",
        }}
      >
        <StyledButton
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => navigate(-1)}
          sx={{
            display: { xs: "none", sm: "none", md: "flex" },
            mb: { xs: 1, sm: 0 },
            mr: 2,
          }}
          aria-label="Go back"
        >
          <Typography sx={{ fontWeight: "700" }}>Back</Typography>
        </StyledButton>
        <Typography
          variant="h4"
          align="center"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: "medium",
          }}
        >
          Browse Categories
        </Typography>
      </Box>

      {/* Categories Grid */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2 }}
        sm={8}
        md={12}
        lg={12}
        sx={{
          justifyContent: "center",
        }}
      >
        {categories.map((category) => {
          const {
            id,
            description = "Explore top listings under this category.",
            imageForCategory,
          } = category;

          const displayName = id ? formatCategoryName(id) : "Unnamed Category";

          return (
            <Grid
              item
              sm={4}
              md={2}
              lg={1}
              key={id}
              sx={{
                display: "flex",
                width: { xs: "80%", sm: 220 },
              }}
            >
              <StyledCard
                elevation={0}
                sx={{
                  width: "100%",
                  backgroundColor: "#ffeede",
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/category/${id}`)}
                  aria-label={`View ${displayName} category`}
                >
                  {/* Image with lazy loading */}
                  <Suspense
                    fallback={
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={200}
                        animation="wave"
                      />
                    }
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        height: { xs: 150, sm: 160 },
                        objectFit: "cover",
                        backgroundColor: "grey.100",
                      }}
                      image={category.image || placeholderImage}
                      alt={displayName}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  </Suspense>

                  {/* Content */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: "center",
                      p: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <Typography
                      title={displayName}
                      gutterBottom
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
                      }}
                    >
                      {displayName}
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
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default CategoriesListPage;
