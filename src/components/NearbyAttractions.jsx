import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NearbyAttractions({ currentItem }) {
  const [nearby, setNearby] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map((doc) => doc.id));
    };
    fetchCategories();
  }, []);

  // Fetch nearby items
  useEffect(() => {
    if (!currentItem?.address || categories.length === 0) return;

    const fetchNearbyItems = async () => {
      let allItems = [];

      for (let category of categories) {
        const snapshot = await getDocs(collection(db, category));
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          category,
          ...doc.data(),
        }));
        allItems = [...allItems, ...items];
      }

      const area =
        typeof currentItem.address === "string"
          ? currentItem.address.split(",")
          : "";
      const areaName = area[area.length - 2].toLowerCase();

      const nearbyItems = allItems
        .filter(
          (item) =>
            item.id !== currentItem.id &&
            typeof item.address === "string" &&
            item.address.toLowerCase().includes(areaName)
        )
        .slice(0, 10);

      setNearby(nearbyItems);
    };

    fetchNearbyItems();
  }, [currentItem, categories]);

  if (nearby.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Nearby Attractions
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          py: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-track": { backgroundColor: "#f0f0f0" },
        }}
      >
        {nearby.map((item) => (
          <Card
            key={item.id}
            component={RouterLink}
            to={`/${item.category}/${item.id}`}
            sx={{
              minWidth: 180,
              maxWidth: 180,
              flex: "0 0 auto",
              borderRadius: 2,
              overflow: "hidden",
              textDecoration: "none",
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-4px)",
                transition: "0.3s",
              },
            }}
          >
            <CardMedia
              component="img"
              height="120"
              image={
                item.image ||
                "https://images.unsplash.com/photo-1561042771-abb14f50b8f4?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt={item.name || "No Name"}
            />
            <CardContent sx={{ p: 1 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {item.name || "Unnamed"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
