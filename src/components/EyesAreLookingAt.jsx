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

export default function EyesAreLookingAt() {
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
                overflow: "hidden",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height={180} />
              <CardContent>
                <Skeleton width="75%" />
              </CardContent>
            </Card>
          </CardShell>
        ))}
      </>
    );
  }

  const eyes = (allItems || []).filter(
    (item) => item.eyes === "1" || item.eyes === "TRUE" || item.eyes === true
  );

  if (!eyes.length) return null;

  const go = (item) => navigate(`/${item.categoryId}/${item.id}`);

  return (
    <>
      {eyes.map((item) => (
        <CardShell key={item.id}>
          <Card
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              overflow: "hidden",
              width: 200,
              height: 250,
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              transition: "all .2s",
            }}
            onClick={() => go(item)}
          >
            <CardActionArea>
              <CardMedia
                component="img"
                height="180"
                image={item.image || "/fallback.jpg"}
                alt={item.name || "Item"}
                loading="lazy"
              />
              <CardContent>
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {item.name || item.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </CardShell>
      ))}
    </>
  );
}
