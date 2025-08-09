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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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

  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="overline" fontSize={18}>
        Categories
      </Typography>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 15 }}
      >
        {categories.map((cat) => (
          <Grid item key={cat.id} size={{ xs: 4, sm: 4, md: 3 }}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
              <CardActionArea
                onClick={() => navigate(`/category/${cat.id}`)}
                sx={{
                  maxHeight: 200,
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={cat.imageForCategory || "/fallback.jpg"}
                  alt={cat.name}
                />
                <CardContent>
                  <Typography variant="subtitle">{cat.name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
