import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Skeleton,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAllItems from "../hooks/useAllItems";

export default function FeaturedListings() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  const CardShell = ({ children }) => (
    <Box sx={{ flex: "0 0 auto", scrollSnapAlign: "start" }}>{children}</Box>
  );

  if (loading) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardShell key={i}>
            <Card
              sx={{
                width: 200,
                height: 250,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height={160} />
              <CardContent>
                <Skeleton width="80%" />
              </CardContent>
            </Card>
          </CardShell>
        ))}
      </>
    );
  }

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const picks = shuffleArray(
    (allItems || []).filter(
      (item) =>
        item.featured === "1" ||
        item.featured === true ||
        item.featured === "TRUE"
    )
  ).slice(0, 20);

  if (!picks.length) return null;

  const go = (item) => navigate(`/${item.categoryId}/${item.id}`);

  return (
    <>
      {picks.map((item) => (
        <CardShell key={item.id}>
          <Card
            sx={{
              width: 200,
              height: 250,
              borderRadius: 3,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              "&:hover": { boxShadow: 6 },
            }}
            onClick={() => go(item)}
          >
            <CardActionArea sx={{ flexGrow: 1 }}>
              <CardMedia
                component="img"
                height="160"
                image={item.image || "/fallback.jpg"}
                alt={item.name || "Editor's Pick"}
                loading="lazy"
              />
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {item.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </CardShell>
      ))}
    </>
  );
}
