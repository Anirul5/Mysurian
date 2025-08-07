import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";

function FeaturedTopics() {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSearches = async () => {
      try {
        const q = query(collection(db, "searchAnalytics"), orderBy("count", "desc"), limit(8));
        const snapshot = await getDocs(q);
        const topSearches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopics(topSearches);
      } catch (error) {
        console.error("Failed to fetch search analytics:", error);
      }
    };

    fetchTopSearches();
  }, []);

  const handleClick = (term) => {
    navigate(`/search?query=${encodeURIComponent(term)}`);
  };

  return (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🔥 Featured Topics
      </Typography>
      <Grid container spacing={2}>
        {topics.map((topic, idx) => (
          <Grid item xs={6} sm={4} md={3} key={idx}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
              onClick={() => handleClick(topic.term)}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight={500}>
                  <WhatshotIcon fontSize="small" sx={{ mr: 1 }} />
                  {topic.term}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {topic.count} searches
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FeaturedTopics;
