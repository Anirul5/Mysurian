import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

function FeaturedTopics() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Filter top 9 by searchcount
  const topics = allItems
    .filter((item) => typeof item.searchcount === "number")
    .sort((a, b) => b.searchcount - a.searchcount)
    .slice(0, 9);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  return (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        <WhatshotIcon fontSize="medium" sx={{ mr: 1, color: "#ee0707ff" }} />
        Featured Topics
      </Typography>
      <Grid container spacing={2} sx={{ justifyContent: "center" }}>
        {topics.map((item, idx) => (
          <Grid item xs={6} sm={4} md={3} key={idx} width={120}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
                height: 120,
              }}
              onClick={() => handleClick(item)}
            >
              <CardContent>
                <WhatshotIcon fontSize="small" sx={{ mr: 1 }} />
                <br />
                <Typography variant="caption" fontWeight={400}>
                  {item.name || "Unnamed Item"}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  {item.searchcount} searches
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
