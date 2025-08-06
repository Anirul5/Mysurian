import React from "react";
import { Card, CardMedia, CardContent, Typography, Box, Rating } from "@mui/material";

const ListingCard = ({ image, name, description, rating }) => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        borderRadius: 4,
        boxShadow: 3,
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={image || "/fallback.jpg"}
        alt={name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {description || "No description available."}
        </Typography>
        {rating && (
          <Box mt={1}>
            <Rating value={Number(rating)} readOnly size="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingCard;
