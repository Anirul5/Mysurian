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
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

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

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <div>
      <Box sx={{ mb: 4 }} maxWidth={"300px"}>
        {/* Section Title */}
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#1e3d49",
            color: "#fff",
            padding: "8px 12px",
          }}
        >
          Featured Topics
        </Typography>

        {/* Grid of Items */}
        <Grid
          container
          spacing={1}
          sx={{ mt: 1 }}
          columns={{ xs: 6, sm: 9, md: 15 }}
          height={"350px"}
        >
          {topics.map((item) => (
            <Grid item key={item.id} size={{ xs: 2, sm: 3, md: 5 }}>
              <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}>
                <CardActionArea
                  onClick={() => handleClick(item)}
                  sx={{
                    maxHeight: 200,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="100"
                    image={item.image || "/fallback.jpg"}
                    alt={item.name}
                  />
                  <ThemeProvider theme={theme}>
                    <Typography
                      variant="subtitle"
                      display={"flex"}
                      height={"35px"}
                      textAlign={"center"}
                      alignItems={"center"}
                      justifyContent={"center"}
                    >
                      {item.name}
                    </Typography>
                  </ThemeProvider>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          <Grid
            item
            size={{ xs: 4, sm: 4, md: 3 }}
            sx={{ width: "100% !important" }}
          >
            <Card
              sx={{
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardActionArea
                sx={{
                  maxHeight: 200,
                  height: "100%",
                }}
              >
                <CardMedia
                  // component="img"
                  height="160"
                />
                <CardContent>
                  <Typography variant="subtitle">
                    Most viewed items till date
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
