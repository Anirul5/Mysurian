// components/EyesAreLookingAt.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ListingCard from './ListingCard';

const EyesAreLookingAt = () => {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const snapshot = await getDocs(collection(db, 'trendingListings'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrending(data);
    };
    fetchTrending();
  }, []);

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>Eyes Are Looking At</Typography>
      <Grid container spacing={3}>
        {trending.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <ListingCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EyesAreLookingAt;
