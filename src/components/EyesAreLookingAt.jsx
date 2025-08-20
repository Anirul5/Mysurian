import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function EyesAreLookingAt() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  const eyes = allItems
    .filter((item) => item.eyes === "1" || item.eyes === true)
    .slice(0, 6);

  if (!eyes.length) return null;

  const go = (item) => navigate(`/${item.category}/${item.id}`);

  return (
    <>
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
      >
        {eyes.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                overflow: "hidden",
                "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
                transition: "all .2s",

                width: "200px",
                height: "250px",
              }}
              onClick={() => go(item)}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="180"
                  image={item.image || "/fallback.jpg"}
                  alt={item.name || "Item"}
                />
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>
                    {item.name || item.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
