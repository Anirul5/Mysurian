import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Chip,
  CardActionArea,
} from "@mui/material";

const events = [
  {
    title: "Mysuru Dasara Festival",
    date: "Oct 1, 2025",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Yoga at Chamundi Hills",
    date: "Aug 15, 2025",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Street Food Carnival",
    date: "Sep 10, 2025",
    image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mysuru Marathon",
    date: "Nov 5, 2025",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=80",
  },
];

export default function LocalEvents({ onEventClick }) {
  return (
    <Box sx={{ mt: 10 }}>
        <Typography variant="h6" pb={2} sx={{ textAlign: "center", opacity: 0.6 }}>
            Local events and offers
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
        {events.map((event, index) => (
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
            <CardActionArea onClick={() => onEventClick && onEventClick(event)}>
              <CardMedia
                component="img"
                height="150"
                image={event.image}
                alt={event.title}
              />
              <CardContent>
                <Chip
                  label={event.date}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" noWrap>
                  {event.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
