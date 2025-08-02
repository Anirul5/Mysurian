import React from "react";
import { Grid, Card, CardActionArea, CardContent, Typography, Box, Button } from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import EventIcon from "@mui/icons-material/Event";
import { Link } from 'react-router-dom';

const categories = [
  { title: "Hotels", icon: <HotelIcon fontSize="large" />, color: "#6A1B9A" },
  { title: "Gyms", icon: <FitnessCenterIcon fontSize="large" />, color: "#FBC02D" },
  { title: "Food", icon: <RestaurantIcon fontSize="large" />, color: "#D32F2F" },
  { title: "Events", icon: <EventIcon fontSize="large" />, color: "#0288D1" },
];

export default function QuickCategories({ onCategoryClick }) {
  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      sx={{ maxWidth: 1200, margin: "auto" }} // Center & set max width
    >
      {categories.map((cat) => (
        <Grid item xs={12} sm={6} md={3} key={cat.title}>
          <Button component={Link} to={`/${cat.title.toLowerCase()}`}>
            <Card
              sx={{
                borderRadius: "16px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: 0,
              "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
              transition: "all 0.3s ease-in-out",
              height: "150px",
              width: "225px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <CardActionArea
              sx={{ height: "100%" }}
            >
              <CardContent>
                <Box sx={{ color: cat.color, mb: 1 }} >{cat.icon}</Box>
                <Typography variant="h6">{cat.title}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}