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
import heroImage from "../assets/hero_mysuru.png";

export default function FeaturedListings() {
  const { allItems, loading } = useAllItems();
  const navigate = useNavigate();

  const CardShell = ({ children }) => (
    <Box sx={{ flex: "0 0 auto", scrollSnapAlign: "start" }}>{children}</Box>
  );

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

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
              cursor: "pointer",
              borderRadius: 3,
              overflow: "hidden",
              width: 200,
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              transition: "all .2s",
            }}
            onClick={() => go(item)}
          >
            <CardActionArea>
              <CardMedia
                component="img"
                height="180"
                image={item.image || heroImage}
                alt={item.name || "Item"}
                loading="lazy"
              />
              <CardContent>
                <Typography sx={{ fontWeight: 600 }} title={item.name} noWrap>
                  {item.name || item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="#8d8b8bff"
                  title={item.title}
                  noWrap
                >
                  {stripHtml(item.description) || item.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </CardShell>
      ))}
    </>
  );
}
