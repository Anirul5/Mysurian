import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Welcome to Mysurian</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Explore everything about Mysuru – Gyms, Hotels, Food, and more.
      </Typography>
    </Container>
  );
}
