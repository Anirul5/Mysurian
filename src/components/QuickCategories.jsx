import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

export default function QuickCategories() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const CACHE_KEY = "quickCategories";
    const CACHE_TIME_KEY = "quickCategoriesTimestamp";
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(categoriesData);

      // Save to sessionStorage
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(categoriesData));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    };

    const cachedData = sessionStorage.getItem(CACHE_KEY);
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

    if (
      cachedData &&
      cachedTime &&
      Date.now() - parseInt(cachedTime) < CACHE_DURATION
    ) {
      // Use cached data
      setCategories(JSON.parse(cachedData));
    } else {
      // Fetch new data
      fetchCategories();
    }
  }, []);
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <div>
      <Box sx={{ mb: 4 }} maxWidth={"300px"}>
        {/* Section Title */}
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#1e3d49",
            color: "#fff",
            padding: "8px 12px",
          }}
        >
          Categories
        </Typography>

        {/* Grid of Items */}
        <Grid
          container
          spacing={1}
          sx={{ mt: 1 }}
          columns={{ xs: 6, sm: 9, md: 15 }}
          height={"350px"}
        >
          {categories.slice(0, 6).map((cat) => (
            <Grid item key={cat.id} size={{ xs: 2, sm: 3, md: 5 }}>
              <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
                <CardActionArea
                  onClick={() => navigate(`/category/${cat.id}`)}
                  sx={{
                    maxHeight: 200,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="100"
                    image={cat.imageForCategory || "/fallback.jpg"}
                    alt={cat.name}
                  />
                  <ThemeProvider theme={theme}>
                    <Typography
                      variant="subtitle"
                      display={"flex"}
                      height={"35px"}
                      textAlign={"center"}
                      alignItems={"center"}
                      justifyContent={"center"}
                    >
                      {cat.name}
                    </Typography>
                  </ThemeProvider>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          <Grid
            item
            size={{ xs: 4, sm: 4, md: 3 }}
            sx={{ width: "100% !important" }}
          >
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/categories`)}
                sx={{
                  maxHeight: 200,
                  height: "100%",
                }}
              >
                <CardMedia
                  // component="img"
                  height="160"
                />
                <CardContent>
                  <Typography variant="subtitle">
                    {"See all categories"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
