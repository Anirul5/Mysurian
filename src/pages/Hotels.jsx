import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function Hotels() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Hotels in Mysuru</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Discover the best hotels in Mysuru for a comfortable food & stay.
      </Typography>
    </Container>
  );
}
