// Editor's Pick
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

export default function EditorsPick() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  // Fisher–Yates shuffle to randomize
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Filter + shuffle + take first 6
  const picks = shuffleArray(
    allItems.filter((item) => item.featured === "1" || item.featured === true)
  ).slice(0, 6);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  return (
    <div style={{ padding: "2rem", paddingTop: "0" }}>
      <Typography variant="overline" fontSize={18}>
        Editor's Pick
      </Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 15 }}
      >
        {picks.map((item) => (
          <Grid item size={{ xs: 4, sm: 4, md: 3 }} key={item.id}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleClick(item)}
            >
              <CardActionArea sx={{ maxHeight: 200 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={item.image || "/fallback.jpg"}
                  alt={item.name || "Editor's Pick"}
                />
                <CardContent>
                  <Typography variant="subtitle">{item.name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
