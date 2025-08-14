// src/context/HomeDataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// FullScreenLoader.jsx
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const HomeDataContext = createContext();

export function HomeDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) {
      fetchHomeData();
    }
  }, []);

  const fetchHomeData = async () => {
    try {
      const topicsSnap = await getDocs(collection(db, "topics"));
      const topicsData = topicsSnap.docs.map((doc) => doc.data());

      const listingsSnap = await getDocs(collection(db, "listings"));
      const listingsData = listingsSnap.docs.map((doc) => doc.data());

      setData({
        topics: topicsData,
        listings: listingsData,
      });
    } catch (err) {
      console.error("Error loading home data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeDataContext.Provider value={{ data, loading }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  return useContext(HomeDataContext);
}

export default function FullScreenLoader() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      }}
    >
      <CircularProgress
        size={80}
        thickness={4}
        sx={{
          color: "#ff6f61",
          mb: 2,
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: "#444",
          fontWeight: 500,
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%": { opacity: 0.6 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0.6 },
          },
        }}
      >
        Loading your experience...
      </Typography>
    </Box>
  );
}
