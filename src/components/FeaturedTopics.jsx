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

export default function FeaturedTopics() {
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
                bgcolor: "#2A1600",
                borderRadius: 3,
                overflow: "hidden",
                width: 200,
                height: 250,
                border: "1px solid #3c2102",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height={160} />
              <CardContent>
                <Skeleton width="70%" />
                <Skeleton width="40%" />
              </CardContent>
            </Card>
          </CardShell>
        ))}
      </>
    );
  }

  const topics = (allItems || [])
    .filter(
      (i) =>
        typeof i.views === "number" ||
        i.featured === "1" ||
        i.featured === true ||
        i.featured === "TRUE"
    )
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 12);

  if (!topics.length) return null;

  const go = (item) => navigate(`/${item.categoryId}/${item.id}`);

  return (
    <>
      {topics.map((item) => (
        <CardShell key={item.id}>
          <Card
            sx={{
              bgcolor: "#2A1600",
              borderRadius: 3,
              overflow: "hidden",
              width: 200,
              height: 250,
              border: "1px solid #3c2102",
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              transition: "all .2s",
            }}
          >
            <CardActionArea onClick={() => go(item)}>
              <CardMedia
                component="img"
                height="160"
                image={item.image || heroImage}
                alt={item.name || "Featured"}
                loading="lazy"
              />
              <CardContent sx={{ color: "white" }}>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                {typeof item.views === "number" && (
                  <Typography variant="caption" sx={{ color: "#ffcc9c" }}>
                    {item.views} views
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </CardShell>
      ))}
    </>
  );
}
