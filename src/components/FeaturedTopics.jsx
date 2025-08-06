// components/FeaturedTopics.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Grid } from '@mui/material';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const FeaturedTopics = () => {
  const [topCategories, setTopCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopCategories = async () => {
      const q = query(collection(db, 'searchAnalytics'), orderBy('count', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        name: doc.id,
        ...doc.data(),
      }));
      setTopCategories(categories);
    };
    fetchTopCategories();
  }, []);

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>Featured Topics</Typography>
      <Grid container spacing={2}>
        {topCategories.map((cat, idx) => (
          <Grid item key={idx}>
            <Chip
              label={cat.name}
              onClick={() => navigate(`/${cat.name.toLowerCase()}`)}
              color="primary"
              variant="outlined"
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedTopics;
