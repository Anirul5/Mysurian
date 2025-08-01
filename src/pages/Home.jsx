import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button } from '@mui/material';

const features = [
  { title: "Gyms", description: "Find the best fitness centers in Mysuru", link: "/gyms" },
  { title: "Hotels", description: "Discover top-rated places to stay", link: "/hotels" },
  //{ title: "Food", description: "Explore delicious food spots", link: "/food" },
  //{ title: "Tourism", description: "Plan your visits to major attractions", link: "/tourism" },
];

export default function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" gutterBottom>
          Welcome to Mysurian
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your one-stop guide to everything in Mysuru
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5">{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href={feature.link}>Explore</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
