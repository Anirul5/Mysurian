import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import SearchBar from "../components/SearchBar";
import QuickCategories from "../components/QuickCategories";
import FeaturedHotels from "../components/FeaturedHotels"; 

const features = [
  { title: "Gyms", description: "Find the best fitness centers in Mysuru", link: "/gyms" },
  { title: "Hotels", description: "Discover top-rated places to stay", link: "/hotels" },
  //{ title: "Food", description: "Explore delicious food spots", link: "/food" },
  //{ title: "Tourism", description: "Plan your visits to major attractions", link: "/tourism" },
];

export default function Home() {
  const handleCategoryClick = (category) => {
    console.log("Clicked:", category);
    // You can navigate to `/hotels` or `/gyms` etc.
  };
  return (
    <Container sx={{ mt: 4 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h1" gutterBottom borderTop={2} borderColor="primary.main" pt={10} pb={2}>
          Discover Mysuru Like Never Before
        </Typography>
        <Typography variant="h6" color="text.secondary" pb={10}>
          Uncover the best places, experiences, and secrets of the city!
        </Typography>
      </Box>
      <Container maxWidth="md"> {/* Search Bar */}
      <Box sx={{ mt: 5 , mb: 5}}>
        <SearchBar />
      </Box>
      </Container>
      <Container maxWidth="lg">
      <Box sx={{ mt: 10 }}>
        <QuickCategories onCategoryClick={handleCategoryClick} />
      </Box>
      </Container>
      <Container maxWidth="lg">
      <Box sx={{ mt: 5 }}>
        <FeaturedHotels />
      </Box>
      </Container>
    </Container>
  );
}
