import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function NearbyAttractions({ currentItem }) {
  const [nearby, setNearby] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Calculate the current page based on scrollLeft
  const containerRef = useRef();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

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

  const handleNext = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(nearby.length / cardsPerPage);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
    setCurrentPage(page);
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Nearby Attractions
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* <IconButton onClick={handlePrev} disabled={currentPage === 0}>
          <ChevronLeftIcon />
        </IconButton> */}
        <Box
          ref={containerRef}
          onScroll={handleScroll}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollBehavior: "smooth",
            px: 1, // partial peek
            mr: 2,
            "&::-webkit-scrollbar": { display: "block" }, // hide scrollbar
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
                  "https://images.unsplash.com/photo-1561042771-abb14f50b8f4?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt={item.name || "No Name"}
                loading="lazy"
              />
              <CardContent sx={{ p: 1 }}>
                <Typography variant="body2" fontWeight={500} noWrap>
                  {item.name || "Unnamed"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        {/* <IconButton
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRightIcon />
        </IconButton> */}
      </Box>

      {/* Dot indicators */}
      {/* <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: idx === currentPage ? "orange" : "#ccc",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </Stack> */}
    </Box>
  );
}
