// EditorsPick.jsx
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

function EditorsPick() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  if (loading) return null;

  const picks = allItems.filter((item) => item.featured === "1").slice(0, 6);

  const handleClick = (item) => {
    navigate(`/${item.category}/${item.id}`);
  };

  return (
    <Box my={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        <StarIcon fontSize="medium" sx={{ mr: 1, color: "#eaee07ff" }} />
        Editor's Pick
      </Typography>
      <Grid
        container
        spacing={2}
        columns={18}
        sx={{ justifyContent: "center" }}
      >
        {picks.map((item, idx) => (
          <Grid item xs={6} sm={4} md={2} key={idx} size={3} minWidth={120}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 6 },
                height: 120,
                width: "100%",
              }}
              onClick={() => handleClick(item)}
            >
              <CardContent>
                <StarIcon fontSize="small" sx={{ mr: 1 }} />
                <br />
                <Typography variant="caption" fontWeight={400}>
                  {item.name || "Unnamed Item"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default EditorsPick;
