import React from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function FeaturedTopics() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Top by views (fallback to featured)
  const topics = allItems
    .filter(
      (i) =>
        typeof i.views === "number" || i.featured === "1" || i.featured === true
    )
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);

  const go = (item) => navigate(`/${item.categoryId}/${item.id}`);

  return (
    <Grid
      container
      spacing={3}
      sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
    >
      {topics.map((item) => (
        <Grid key={item.id} item xs={12} sm={6} md={4}>
          <Card
            sx={{
              bgcolor: "#2A1600",
              borderRadius: 3,
              overflow: "hidden",
              width: "200px",
              height: "250px",
              border: "1px solid #3c2102",
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              transition: "all .2s",
            }}
          >
            <CardActionArea onClick={() => go(item)}>
              <CardMedia
                component="img"
                height="160"
                image={item.image || "/fallback.jpg"}
                alt={item.name || "Featured"}
              />
              <CardContent sx={{ color: "white" }}>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                {typeof item.views === "number" && (
                  <Typography variant="caption" sx={{ color: "#ffcc9c" }}>
                    {item.views} views
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
