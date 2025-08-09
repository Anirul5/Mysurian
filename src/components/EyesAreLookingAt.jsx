import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function EyesAreLookingAt() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Filter for items with "eyes" flag
  const eyes = allItems.filter((item) => item.eyes === "1").slice(0, 6);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  if (!eyes.length) return null;

  return (
    <div style={{ padding: "2rem", paddingTop: "0" }}>
      <Typography variant="overline" fontSize={18}>
        Eyes Are Looking At
      </Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 15 }}
      >
        {eyes.map((item) => (
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
                  alt={item.name || "Item"}
                />
                <CardContent>
                  <Typography variant="subtitle">{item.name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
