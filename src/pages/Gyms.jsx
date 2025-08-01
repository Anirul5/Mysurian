import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function Gyms() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Gyms in Mysuru</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Discover the best gyms in Mysuru to stay fit and healthy.
      </Typography>
    </Container>
  );
}
