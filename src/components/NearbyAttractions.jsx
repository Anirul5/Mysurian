import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NearbyAttractions({ currentItem }) {
  const [nearby, setNearby] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollMax, setScrollMax] = useState(0);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
      setScrollMax(
        containerRef.current.scrollWidth - containerRef.current.clientWidth
      );
    }
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
    setCurrentPage(page);
  };
  // Responsive cards per view
  let cardsPerPage = 3;
  if (isXs) cardsPerPage = 1;
  else if (isSm) cardsPerPage = 2;
  else if (isMd) cardsPerPage = 3;
  else if (isLg) cardsPerPage = 4;

  const cardWidth = 180 + 16; // card width + gap

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
          : [];
      const areaName = area[area.length - 2]?.toLowerCase();

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

  const totalPages = Math.ceil(nearby.length / cardsPerPage);

  // const handleScroll = () => {
  //   if (!containerRef.current) return;
  //   const scrollLeft = containerRef.current.scrollLeft;
  //   const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
  //   setCurrentPage(page);
  // };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Nearby Attractions
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60px",
            height: "100%",
            pointerEvents: "none",
            background: "linear-gradient(to left, transparent, white)",
          }}
        />
        {/* Scroll wrapper with fade */}
        <Box sx={{ position: "relative", flex: 1, width: "80%" }}>
          <Box
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              scrollBehavior: "smooth",
              px: 1,
              mr: 2,
              "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
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
                  my: "10px",
                  flex: "0 0 auto",
                  borderRadius: 2,
                  overflow: "hidden",
                  textDecoration: "none",
                  boxShadow: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-6px) scale(1.02)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image={
                    item.image ||
                    "https://images.unsplash.com/photo-1561042771-abb14f50b8f4?q=80&w=735&auto=format&fit=crop"
                  }
                  alt={item.name || "No Name"}
                  loading="lazy"
                />
                <CardContent sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    noWrap
                    title={item.name || "Unnamed"} // native tooltip
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 1,
                        zIndex: 2,
                        position: "relative",
                      },
                    }}
                  >
                    {item.name || "Unnamed"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          {/* Left fade (only show if scrolled > 0) */}
          {scrollLeft > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60px",
                height: "100%",
                pointerEvents: "none",
                background: "linear-gradient(to left, transparent, white)",
              }}
            />
          )}

          {/* Right fade (always visible if scrollable) */}
          {scrollLeft < scrollMax && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "60px",
                height: "100%",
                pointerEvents: "none",
                background: "linear-gradient(to right, transparent, white)",
              }}
            />
          )}
        </Box>
      </Box>

      {/* Dot indicators */}
      {/* Dot indicators */}
      <Stack direction="row" justifyContent="center" mt={2}>
        {Array.from({
          length: Math.ceil(nearby.length / cardsPerPage) - 1,
        }).map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setCurrentPage(index);
              if (containerRef.current) {
                const scrollX = index * containerRef.current.clientWidth;
                containerRef.current.scrollTo({
                  left: scrollX,
                  behavior: "smooth",
                });
              }
            }}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: index === currentPage ? "#f5b625" : "#8b8989ff",
              mx: 0.5,
              cursor: "pointer",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
