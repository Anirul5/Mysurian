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

export default function FeaturedListings() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      // Example: Fetch hotels as featured listings
      const hotelsCollection = collection(db, "hotels");
      const snapshot = await getDocs(hotelsCollection);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        category: "hotels"
      }));
      setFeatured(list.slice(0, 3)); // only first 3
    };
    fetchFeatured();
  }, []);

  return (
    <Container sx={{ mt: 10 }}>
      <Typography
        variant="h6"
        pb={2}
        sx={{ textAlign: "center", opacity: 0.6 }}
      >
        Featured Listings
      </Typography>
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {featured.map(item => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={item.id}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 0,
                cursor: "pointer",
                maxWidth: 300,
                "&:hover": { boxShadow: 0, transform: "scale(1.01)" },
                transition: "all 0.3s ease-in-out",
                display: "flex",
                flexDirection: "column",
                height: "100%"
              }}
              onClick={() => navigate(`/${item.category}/${item.id}`)}
            >
              {item.imageURL && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageURL}
                  alt={item.name}
                  sx={{
                    objectFit: "cover",
                    width: "100%"
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.name}</Typography>
                {item.address && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {item.address}
                  </Typography>
                )}
                {item.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      lineHeight: 1.4
                    }}
                  >
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
