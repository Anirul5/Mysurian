import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function DetailPage() {
  const { collectionName, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchItem();
  }, [collectionName, id]);

  if (!item) return <Container sx={{ mt: 4 }}>Loading...</Container>;

  return (
    <Box>
      <Helmet>
        <title>{`${item.name} | Mysurian`}</title>
        <meta
          name="description"
          content={item.description || `Learn more about ${item.name} in Mysuru.`}
        />
        {item.imageURL && <meta property="og:image" content={item.imageURL} />}
        <meta
          property="og:url"
          content={`https://mysurian09.web.app/${collectionName}/${item.id}`}
        />
      </Helmet>
      {/* Hero Image */}
      <motion.div
        style={{
          position: "relative",
          height: "80vh",
          backgroundImage: `url(${item.imageURL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Gradient Fade */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        />

        {/* Overlay Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: 30,
            left: 0,
            color: "#fff",
            paddingLeft: "20px",
            paddingRight: "20px",
            maxWidth: "90%",
          }}
        >
          <Typography variant="h3" fontWeight="bold">
            {item.name}
          </Typography>
          {item.address && (
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              📍 {item.address}
            </Typography>
          )}
        </motion.div>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#000",
            borderRadius: "50px",
            padding: "6px 16px",
            textTransform: "none",
            backdropFilter: "blur(6px)", 
            width: "fit-content",
            margin: "0",
            paddingRight: "3px",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.4)" },
          }}
        >
        </Button>
      </motion.div>

      {/* Details Section */}
      <Container sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Overview
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {item.rating && (
              <Typography variant="h6" gutterBottom>
                ⭐ Rating: {item.rating}
              </Typography>
            )}
            {item.contact && (
              <Typography variant="h6" gutterBottom>
                📞 Contact: {item.contact}
              </Typography>
            )}
            {item.cuisine && (
              <Typography variant="h6" gutterBottom>
                🍽️ Cuisine: {item.cuisine}
              </Typography>
            )}
            {item.date && (
              <Typography variant="h6" gutterBottom>
                📅 Date: {item.date}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {item.description && (
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {item.description}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
