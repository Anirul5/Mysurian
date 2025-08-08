import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

function EyesAreLookingAt() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  const eyes = allItems.filter((item) => item.eyes === "1").slice(0, 6);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  return (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        <VisibilityIcon fontSize="small" sx={{ mr: 1, color: "#3653f7ff" }} />
        Eyes Are Looking At
      </Typography>
      <Grid
        container
        spacing={2}
        columns={18}
        sx={{ justifyContent: "center" }}
      >
        {eyes.map((item, idx) => (
          <Grid item xs={6} sm={4} md={2} key={idx} size={3} minWidth={120}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
                height: 120,
              }}
              onClick={() => handleClick(item)}
            >
              <CardContent>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                <br />
                <Typography variant="caption" fontWeight={400}>
                  {item.name || "Unnamed Item"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default EyesAreLookingAt;
