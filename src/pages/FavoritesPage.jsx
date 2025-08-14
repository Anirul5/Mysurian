// FavoritesPage.jsx
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Container,
  Box,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setFavorites(snap.data().favorites || []);
      }
    };
    fetchFavorites();
  }, [user]);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  if (!user) return <p>Please log in to see your favorites</p>;

  return (
    <Container sx={{ py: 5 }}>
      <Box sx={{ display: "flex", width: "80%", justifySelf: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => navigate(`/`)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" align="center" gutterBottom width={"100%"}>
          Your Favorites
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        {favorites.map((item) => {
          return (
            <Grid item key={item}>
              <Card
                elevation={4}
                sx={{
                  minWidth: { xs: 240, sm: 280 },
                  maxWidth: 320,
                  minHeight: 200,
                  height: { xs: 280, sm: 300, md: 340 },
                  borderTop: `6px solid`,
                  borderRadius: 3,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardActionArea
                  onClick={() => handleClick(item)}
                  sx={{ height: "100%" }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image}
                    alt={item.name}
                    onError={(e) => {}}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom textAlign="center">
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
