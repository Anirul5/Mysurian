import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
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

export default function QuickCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const CardShell = ({ children }) => (
    <Box sx={{ flex: "0 0 auto", scrollSnapAlign: "start" }}>{children}</Box>
  );

  if (loading) {
    return (
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
        {Array.from({ length: 10 }).map((_, i) => (
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
      </Box>
    );
  }

  return (
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
      {categories.slice(0, 10).map((cat) => (
        <CardShell key={cat.id}>
          <Card
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              overflow: "hidden",
              width: 200,
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              transition: "all .2s",
            }}
            onClick={() => navigate(`/category/${cat.id}`)}
          >
            <CardActionArea>
              <CardMedia
                component="img"
                height="180"
                image={
                  cat.image ||
                  "https://images.unsplash.com/photo-1579429223126-29d2f6f9c1ac?q=80&w=600&auto=format"
                }
                alt={cat.name}
                loading="lazy"
              />
              <CardContent>
                <Typography sx={{ fontWeight: 600 }} noWrap title={cat.name}>
                  {cat.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </CardShell>
      ))}

      {/* See All */}
      <CardShell>
        <Card
          sx={{
            cursor: "pointer",
            borderRadius: 3,
            overflow: "hidden",
            width: 200,
            "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
            transition: "all .2s",
          }}
          onClick={() => navigate("/categories")}
        >
          <CardActionArea>
            <CardMedia
              component="img"
              height="180"
              image="https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=600&auto=format"
              alt="See All"
              loading="lazy"
            />
            <CardContent>
              <Typography sx={{ fontWeight: 600 }} noWrap>
                See All Categories
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </CardShell>
    </Box>
  );
}
