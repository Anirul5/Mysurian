import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function FeaturedListings() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Shuffle array for randomness
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const picks = shuffleArray(
    allItems.filter((item) => item.featured === "1" || item.featured === true)
  ).slice(0, 6);

  const handleClick = (item) => navigate(`/${item.category}/${item.id}`);

  return (
    <div>
      {/* <Typography variant="overline" fontSize={18}>
        Editor&apos;s Pick
      </Typography> */}

      <Grid
        container
        spacing={3}
        sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
      >
        {picks.map((item) => (
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
                width: "100%",
                maxWidth: 300,
                borderRadius: 3,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleClick(item)}
            >
              <CardActionArea sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.image || "/fallback.jpg"}
                  alt={item.name || "Editor's Pick"}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
