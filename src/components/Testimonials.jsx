import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const testimonialsData = [
  {
    name: "Priya Sharma",
    location: "Mysuru",
    image:
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=800&q=80",
    text: "During my recent visit to Mysuru, I discovered Mysurian, and it completely transformed my trip. From the most charming hotels to the hidden gems in the local food scene, the recommendations were spot on. The interface made searching super easy, and I loved the detailed descriptions. The highlight was attending the Mysuru Dasara festival, something I would have missed without Mysurian’s event alerts. It felt like I had a local guide in my pocket the whole time.",
  },
  {
    name: "Arjun Kumar",
    location: "Chennai",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    text: "I often travel to Mysuru for work, but this time, I decided to explore the city beyond meetings. Mysurian’s curated gym list helped me find a fantastic fitness center close to my hotel, and the restaurant suggestions were equally impressive. The platform’s smooth design made browsing a pleasure. I even discovered a weekend yoga event at Chamundi Hills that turned out to be the perfect way to unwind. Mysurian isn’t just a directory; it’s a travel companion.",
  },
  {
    name: "Neha Verma",
    location: "Bengaluru",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    text: "A weekend getaway to Mysuru was made extra special thanks to Mysurian. I was looking for authentic local food, and Mysurian introduced me to Vinayaka Mylari’s iconic dosa — it was divine! The app’s event section also highlighted a cultural program at the Palace, which was magical. I appreciate how Mysurian keeps everything organized and easy to find. I’ll definitely be using it again for my next trip and recommending it to friends.",
  },
];

export default function Testimonials() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Shuffle testimonials every time component mounts
    const shuffled = [...testimonialsData].sort(() => Math.random() - 0.5);
    setTestimonials(shuffled);
  }, []);

  const handleOpen = (testimonial) => {
    setSelected(testimonial);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ mt: 5 }}>
        <Typography variant="h6"  pb={2} sx={{ textAlign: "center", opacity: 0.6 }}>
        Stories from Our Users
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
        {testimonials.map((t, index) => (
          <Card
            key={index}
            sx={{
              width: 400,
              height: 350,
              position: "relative",
              borderRadius: "16px",
              color: "#fff",
              overflow: "hidden",
              flex: "0 0 auto",
              boxShadow: 0,
               "&:hover": { boxShadow: 0, transform: "scale(1.01)" },
              transition: "all 0.3s ease-in-out",
            }}
          >
            <CardActionArea
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${t.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                p: 2,
              }}
              onClick={() => handleOpen(t)}
            >
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {t.name} • {t.location}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {t.text.length > 120 ? t.text.slice(0, 120) + "..." : t.text}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ position: "relative", p: 0 }}>
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${selected.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  color: "#fff",
                  p: 2,
                }}
              >
                <Typography variant="h6">
                  {selected.name} • {selected.location}
                </Typography>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1">{selected.text}</Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
