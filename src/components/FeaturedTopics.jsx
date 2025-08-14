import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function FeaturedTopics() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Filter top 9 by searchcount
  const topics = allItems
    .filter((item) => typeof item.views === "number")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  return (
    <div style={{ padding: "2rem", paddingTop: "0" }}>
      <Typography variant="overline" fontSize={18}>
        Featured Topics
      </Typography>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 15 }}
      >
        {topics.map((item) => (
          <Grid item size={{ xs: 4, sm: 4, md: 3 }} key={item.id}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleClick(item)}
            >
              <CardActionArea sx={{ maxHeight: 200 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.image || "/fallback.jpg"}
                  alt={item.name || "Featured Topic"}
                />
                <CardContent>
                  <Typography variant="subtitle">{item.name}</Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    {item.searchcount} searches
                  </Typography> */}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
