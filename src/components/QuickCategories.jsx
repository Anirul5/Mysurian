import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Skeleton,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function QuickCategories({ floating = false }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  // Detect screen size
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isMobilePlusTab = useMediaQuery("(max-width:900px)");
  const isTablet = useMediaQuery("(min-width:601px) and (max-width:1020px)");
  const isTabletOrAbove = useMediaQuery(theme.breakpoints.up("md"));

  const sliceCount = isMobile ? 5 : isTablet ? 4 : 6;

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // Loading skeletons
  if (loading) {
    if (isMobile || isMobilePlusTab) {
      return (
        <Box sx={{ display: "flex", overflowX: "auto", gap: 2, p: 1 }}>
          {Array.from(new Array(5)).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={140}
              height={140}
              sx={{ borderRadius: 3, flex: "0 0 auto" }}
            />
          ))}
        </Box>
      );
    }
    return (
      <Grid container spacing={3} justifyContent="center">
        {Array.from(new Array(6)).map((_, i) => (
          <Grid item xs={6} sm={4} md={3} key={i}>
            <Skeleton
              variant="rectangular"
              width={220}
              height={200}
              sx={{ borderRadius: 3 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      {/* 📱 Mobile: Horizontal Scroll */}
      {(isMobile || isMobilePlusTab) && (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            p: 1,
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {categories.slice(0, sliceCount).map((cat) => (
            <Fade in key={cat.id}>
              <Paper
                onClick={() => navigate(`/category/${cat.id}`)}
                sx={{
                  flex: "0 0 auto",
                  width: 140,
                  height: 140,
                  p: 2,
                  borderRadius: 3,
                  textAlign: "center",
                  alignContent: "center",
                  cursor: "pointer",
                  scrollSnapAlign: "start",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 45,
                    height: 45,
                    mx: "auto",
                    borderRadius: "50%",
                    bgcolor: "#FFF1E6",
                    overflow: "hidden",
                    mb: 1,
                  }}
                >
                  <img
                    src={
                      cat.imageForCategory ||
                      "https://images.unsplash.com/photo-1579429223126-29d2f6f9c1ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    }
                    alt={cat.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Typography fontWeight={700} fontSize={13}>
                  {cat.name}
                </Typography>
              </Paper>
            </Fade>
          ))}

          {/* See All */}
          <Paper
            onClick={() => navigate(`/categories`)}
            sx={{
              flex: "0 0 auto",
              width: 140,
              height: 140,
              p: 2,
              borderRadius: 3,
              textAlign: "center",
              cursor: "pointer",
              scrollSnapAlign: "start",
              alignContent: "center",
              "&:hover": { transform: "translateY(-3px)", boxShadow: 3 },
            }}
          >
            <Box
              sx={{
                width: 45,
                height: 45,
                mx: "auto",
                borderRadius: "50%",
                bgcolor: "#FFF1E6",
                overflow: "hidden",
                mb: 1,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=600&auto=format"
                alt="See All Categories"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Typography fontWeight={700} fontSize={13}>
              See All
            </Typography>
          </Paper>
        </Box>
      )}
      {/* 🖥️ Tablet & Desktop: Floating Grid (your pasted style) */}
      {isTabletOrAbove && (
        <Paper
          elevation={floating ? 6 : 0}
          sx={{
            p: 3,
            borderRadius: 3,
            ...(floating && { backdropFilter: "blur(6px)" }),
            background: "#ffeede",
            mb: 5,
          }}
        >
          <Grid container spacing={3} justifyContent="center">
            {categories.slice(0, sliceCount).map((cat, i) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={3}
                key={cat.id || i}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Paper
                  onClick={() => navigate(`/category/${cat.id}`)}
                  sx={{
                    maxWidth: 250,
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "0.3s",
                    height: "100%",
                    width: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      mx: "auto",
                      borderRadius: "50%",
                      bgcolor: "#FFF1E6",
                      color: "#B13D00",
                      fontSize: 30,
                      display: "grid",
                      placeItems: "center",
                      mb: 1,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={
                        cat.imageForCategory ||
                        "https://images.unsplash.com/photo-1579429223126-29d2f6f9c1ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      }
                      alt={cat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Typography fontWeight={500}>{cat.name}</Typography>
                </Paper>
              </Grid>
            ))}

            {/* See All Card */}
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Paper
                onClick={() => navigate(`/categories`)}
                sx={{
                  width: "100%",
                  maxWidth: 250,
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "0.3s",
                  height: "100%",
                  width: "150px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: "auto",
                    borderRadius: "50%",
                    bgcolor: "#FFF1E6",
                    overflow: "hidden",
                    mb: 1,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=1594&auto=format"
                    alt="See All Categories"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Typography fontWeight={500}>See All Categories</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  );
}
