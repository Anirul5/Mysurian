import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Rating,
  Chip,
  CardActionArea,
} from "@mui/material";
import palette from "../theme/palette";

const listings = [
  // Hotels
  {
    name: "Radisson Blu Plaza",
    location: "MG Road, Mysuru",
    rating: 4.5,
    category: "Hotel",
    image:
      "https://images.openai.com/thumbnails/url/GX5iQHicu1mSUVJSUGylr5-al1xUWVCSmqJbkpRnoJdeXJJYkpmsl5yfq5-Zm5ieWmxfaAuUsXL0S7F0Tw7RLU00ic9M9QszzXJ1SjXKLTWp8vcLTS8KLS7VNQvMzPRyLAvMLgx2cvIrM3BMNM0vSdIt900NCzM2clQrBgAXiimF",
  },
  {
    name: "Royal Orchid Metropole",
    location: "Jhansi Rani Lakshmibai Road",
    rating: 4.2,
    category: "Hotel",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },

  // Gyms
  {
    name: "Gold's Gym",
    location: "VV Mohalla, Mysuru",
    rating: 4.6,
    category: "Gym",
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Anytime Fitness",
    location: "Devaraja Mohalla, Mysuru",
    rating: 4.4,
    category: "Gym",
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80",
  },

  // Food
  {
    name: "Mylari Dosa",
    location: "Nazarbad, Mysuru",
    rating: 4.7,
    category: "Food",
    image:
      "https://www.google.com/search?q=dosa&sca_esv=bbf5a8ec84850240&udm=2&biw=1920&bih=945&sxsrf=AE3TifMsaB2GK01-wAfQ0mCnMxhEQXxn2g%3A1754127441805&ei=UdyNaNH4MN6RseMPwPbb8AI&ved=0ahUKEwiR5bz46euOAxXeSGwGHUD7Fi4Q4dUDCBE&uact=5&oq=dosa&gs_lp=EgNpbWciBGRvc2EyBxAjGCcYyQIyDRAAGIAEGLEDGEMYigUyDRAAGIAEGLEDGEMYigUyChAAGIAEGEMYigUyCBAAGIAEGLEDMgoQABiABBhDGIoFMggQABiABBixAzIKEAAYgAQYQxiKBTIIEAAYgAQYsQMyCBAAGIAEGLEDSP0CUEhY9QFwAXgAkAEAmAGTAaABkwGqAQMwLjG4AQPIAQD4AQGYAgKgAr0BwgIGEAAYBxgemAMAiAYBkgcDMS4xoAfXBbIHAzAuMbgHpgHCBwMzLTLIByM&sclient=img#vhid=vCAV-JBSJsIeSM&vssid=mosaic",
  },
  {
    name: "RRR Restaurant",
    location: "Shivarampet, Mysuru",
    rating: 4.3,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80",
  },
];

// Category-specific chip colors
const categoryColors = {
  Hotel: palette.hotel.main,
  Gym: palette.gym.main,
  Food: palette.food.main,
};

export default function FeaturedListings({ onCardClick }) {
  return (
    <Box sx={{ mt: 10 }}>
        <Typography variant="h6" pb={2} sx={{ textAlign: "center", opacity: 0.6 }}>
            Featured Listings
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
        {listings.map((item, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 250,
              borderRadius: "16px",
              boxShadow: 0,
              "&:hover": { boxShadow: 0, transform: "scale(1.01)" },
              transition: "all 0.3s ease-in-out",
              flex: "0 0 auto",
            }}
          >
            <CardActionArea onClick={() => onCardClick && onCardClick(item)}>
              <CardMedia
                component="img"
                height="150"
                image={item.image}
                alt={item.name}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.location}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Rating
                    value={item.rating}
                    precision={0.1}
                    readOnly
                    size="small"
                  />
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                        backgroundColor: categoryColors[item.category],
                        color: "#fff",
                        fontWeight: "bold",
                    }}
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
