import React from "react";
import { Box, Card, CardContent, Typography, CardMedia, Rating } from "@mui/material";

const hotels = [
  {
    name: "Radisson Blu Plaza",
    location: "MG Road, Mysuru",
    rating: 4.5,
    image: "https://source.unsplash.com/400x250/?hotel,luxury",
  },
  {
    name: "Royal Orchid Metropole",
    location: "Jhansi Rani Lakshmibai Road",
    rating: 4.2,
    image: "https://source.unsplash.com/400x250/?hotel,room",
  },
  {
    name: "Fortune JP Palace",
    location: "Abba Road, Mysuru",
    rating: 4.4,
    image: "https://source.unsplash.com/400x250/?hotel,resort",
  },
  {
    name: "Grand Mercure",
    location: "New Sayyaji Rao Road",
    rating: 4.3,
    image: "https://source.unsplash.com/400x250/?hotel,building",
  },
];

export default function FeaturedHotels() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Featured Hotels
      </Typography>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          pb: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {hotels.map((hotel, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 250,
              borderRadius: "16px",
              boxShadow: 3,
              flex: "0 0 auto",
            }}
          >
            <CardMedia
              component="img"
              height="150"
              image={hotel.image}
              alt={hotel.name}
            />
            <CardContent>
              <Typography variant="h6" noWrap>
                {hotel.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {hotel.location}
              </Typography>
              <Rating value={hotel.rating} precision={0.1} readOnly size="small" />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
