import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      // Example: Fetch events as local events
      // You can also merge data from multiple collections if needed
      const eventsCollection = collection(db, "events");
      const snapshot = await getDocs(eventsCollection);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        category: "events" // Add category for navigation
      }));
      setFeatured(list.slice(0, 3)); // Only first 3 for featured
    };
    fetchFeatured();
  }, []);

  return (
    <Container sx={{ mt: 10 }}>
      <Typography variant="h6" pb={2} sx={{ textAlign: "center", opacity: 0.6 }}>
        Local Events
      </Typography>
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {featured.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 0, cursor: "pointer",
                width:350, height: 300, 
                "&:hover": { boxShadow: 0, transform: "scale(1.01)" },
                transition: "all 0.3s ease-in-out",
              }}
              onClick={() => navigate(`/${item.category}/${item.id}`)}
            >
              {item.imageURL && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageURL}
                  alt={item.name}
                  
                />
              )}
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                {item.address && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {item.address}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body2">
                    ⭐ {item.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
