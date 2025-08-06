import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container, Typography, Box, Grid, Button, Rating,
  Card, CardMedia, IconButton, Skeleton
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

export default function DetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const category = location.pathname.split("/")[1];
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const placeholderImage = "https://source.unsplash.com/400x300/?building";
  const placeholderCover = "https://source.unsplash.com/800x600/?mysore";

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const docRef = doc(db, category, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure gallery is always an array of valid URLs
        if (!Array.isArray(data.gallery)) {
          data.gallery = data.gallery ? [data.gallery] : [];
        }
        // Remove empty or invalid URLs
        data.gallery = data.gallery.filter(url => typeof url === "string" && url.trim() !== "");
        setItem(data);
        // console.log("Fetched item:", data); // Debugging
      }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    fetchItem();
  }, [id, category]);

  const handleShare = () => {
    if (navigator.share && item) {
      navigator.share({
        title: item.name,
        text: `Check out ${item.name} in Mysuru`,
        url: window.location.href
      });
    }
  };

  // Helper to check for valid Google Maps embed URL
  const isValidMapEmbed = url =>
    typeof url === "string" && url.startsWith("https://www.google.com/maps/embed");

  return (
    <Container sx={{ mt: 4 }}>
      <Helmet>
        <title>
          {item?.name
            ? `${item.name} | ${category.charAt(0).toUpperCase() + category.slice(1)} in Mysuru | Mysurian`
            : "Loading... | Mysurian"}
        </title>
        <meta
          name="description"
          content={item?.description || `Details about ${item?.name || "this listing"}`}
        />
      </Helmet>
      <Box mb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <ArrowBack sx={{ verticalAlign: "middle", mr: 0.5, color: "grey" }} color="secondary" component={Link} to={`/category/${category}`} fontSize="inherit" />
          <MuiLink component={Link} to="/categories" underline="hover" color="inherit">
            Categories
          </MuiLink>
          <MuiLink component={Link} to={`/category/${category}`} underline="hover" color="inherit">
            {category?.replace(/-/g, " ")}
          </MuiLink>
          <Typography color="text.primary">{item?.name}</Typography>
        </Breadcrumbs>
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 2, mb: 3 }} />
      ) : (
        <Box
          sx={{
            position: "relative",
            height: 350,
            overflow: "hidden",
            borderRadius: 2,
            mb: 3,
            "&:hover img": { transform: "scale(1.05)" }
          }}
        >
          <img
            src={item?.gallery?.[0] || placeholderCover}
            alt={item?.name}
            onError={e => (e.target.src = placeholderCover)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease"
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top right, rgba(0,0,0,0.6), rgba(0,0,0,0))"
            }}
          />
          <Box sx={{ position: "absolute", bottom: 16, left: 16, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
            <Typography variant="h5" fontWeight="bold">{item.name}</Typography>
            {item?.rating && (
              <Box display="flex" alignItems="center" mt={0.5}>
                <Rating value={item.rating} precision={0.1} readOnly sx={{ color: "#fff" }} />
                <Typography variant="body2" sx={{ ml: 1 }}>{item.rating} / 5</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton onClick={handleShare} sx={{ color: "#fff" }}><ShareIcon /></IconButton>
            <IconButton sx={{ color: "#fff" }}><FavoriteBorderIcon /></IconButton>
          </Box>
        </Box>
      )}

      {/* Gallery */}
      {loading ? (
        <Grid container spacing={2} mb={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        Array.isArray(item.gallery) && item.gallery.length > 1 ? (
          <>
            <Grid container spacing={2} mb={3}>
              {item.gallery.slice(1).map((img, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    onClick={() => {
                      setPhotoIndex(index + 1);
                      setLightboxOpen(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      overflow: "hidden",
                      "&:hover img": { transform: "scale(1.05)" }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={img || placeholderImage}
                      onError={e => (e.target.src = placeholderImage)}
                      alt={`${item.name} image ${index + 2}`}
                      sx={{
                        objectFit: "cover",
                        transition: "transform 0.5s ease"
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>

            {lightboxOpen && (
              <Lightbox
                mainSrc={item.gallery[photoIndex]}
                nextSrc={item.gallery[(photoIndex + 1) % item.gallery.length]}
                prevSrc={item.gallery[(photoIndex + item.gallery.length - 1) % item.gallery.length]}
                onCloseRequest={() => setLightboxOpen(false)}
                onMovePrevRequest={() =>
                  setPhotoIndex((photoIndex + item.gallery.length - 1) % item.gallery.length)
                }
                onMoveNextRequest={() =>
                  setPhotoIndex((photoIndex + 1) % item.gallery.length)
                }
              />
            )}
          </>
        ) : item.gallery?.length === 1 ? (
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="240"
              image={item.gallery[0] || placeholderImage}
              onError={e => (e.target.src = placeholderImage)}
              alt={`${item.name} image`}
              sx={{ objectFit: "cover", borderRadius: 2 }}
            />
          </Card>
        ) : (
          <Typography variant="body2" color="text.secondary" mb={2}>
            No gallery available.
          </Typography>
        )
      )}

      {/* Description */}
      {loading ? (
        <Skeleton variant="text" width="100%" height={60} />
      ) : item?.description && (
        <Typography variant="body2" paragraph>{item.description}</Typography>
      )}

      {/* Contact Buttons */}
      {loading ? (
        <Skeleton variant="rectangular" width={180} height={38} sx={{ mb: 3, borderRadius: 2 }} />
      ) : (
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {item.contact && (
            <Button variant="contained" color="primary" startIcon={<CallIcon />} href={`tel:${item.contact}`}>
              Call Now
            </Button>
          )}
          {item.whatsapp && (
            <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </Button>
          )}
          {item.website && (
            <Button variant="contained" color="info" startIcon={<LanguageIcon />} href={item.website} target="_blank" rel="noopener noreferrer">
              Visit Website
            </Button>
          )}
        </Box>
      )}

      {/* Address */}
      {loading ? (
        <Skeleton variant="text" width="60%" height={25} />
      ) : item?.address && (
        <>
          <Typography variant="h6" gutterBottom>Address</Typography>
          <Typography variant="body2" paragraph>{item.address}</Typography>
        </>
      )}

      {/* Map Embed */}
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
      ) : isValidMapEmbed(item?.mapEmbed) ? (
        <Box sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
          <iframe
            src={item.mapEmbed}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Map not available.
        </Typography>
      )}

      {/* User Reviews */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>User Reviews</Typography>
        <Typography variant="body2" color="text.secondary">
          Reviews coming soon...
        </Typography>
      </Box>

      {/* Nearby Attractions */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Nearby Attractions</Typography>
        <Typography variant="body2" color="text.secondary">
          We'll soon show nearby attractions around this location.
        </Typography>
      </Box>
    </Container>
  );
}