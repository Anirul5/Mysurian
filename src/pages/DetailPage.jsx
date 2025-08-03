import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container, Typography, Box, Grid, Button, Breadcrumbs, Link as MuiLink,
  Rating, Card, CardMedia, IconButton, Skeleton
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

export default function DetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const category = location.pathname.split("/")[1]; // e.g. "hotels"
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const docRef = doc(db, category, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem(docSnap.data());
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

  return (
    <Container sx={{ mt: 4 }}>
      <Helmet>
        <title>{item ? item.name : "Loading..."} | {category.charAt(0).toUpperCase() + category.slice(1)} in Mysuru | Mysurian</title>
        <meta name="description" content={item?.description || `Details about ${item?.name || ""}`} />
      </Helmet>

      {/* Breadcrumb */}
      {/* <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
        <MuiLink component={Link} to={`/${category}`} underline="hover" color="inherit">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </MuiLink>
        <Typography color="text.primary">{item?.name || "Loading..."}</Typography>
      </Breadcrumbs> */}

      {/* Title & Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
        {loading ? (
          <Skeleton variant="text" width={250} height={40} />
        ) : (
          <Typography variant="h4" fontWeight="bold">{item.name}</Typography>
        )}
        <Box>
          <IconButton onClick={handleShare}><ShareIcon /></IconButton>
          <IconButton><FavoriteBorderIcon /></IconButton>
        </Box>
      </Box>

      {/* Rating */}
      {loading ? (
        <Skeleton variant="text" width={100} height={30} />
      ) : item?.rating && (
        <Box display="flex" alignItems="center" mb={3}>
          <Rating value={item.rating} precision={0.1} readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {item.rating} / 5
          </Typography>
        </Box>
      )}

      {/* Gallery */}
      {loading ? (
        <Grid container spacing={2} mb={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : item?.gallery && item.gallery.length > 0 && (
        <>
          <Grid container spacing={2} mb={3}>
            {item.gallery.map((img, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card onClick={() => { setPhotoIndex(index); setLightboxOpen(true); }} sx={{ cursor: "pointer" }}>
                  <CardMedia component="img" height="200" image={img} alt={`${item.name} image ${index + 1}`} />
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
      )}

      {/* Description */}
      {loading ? (
        <Skeleton variant="text" width="100%" height={80} />
      ) : item?.description && (
        <Typography variant="body1" paragraph>{item.description}</Typography>
      )}

      {/* Contact Buttons */}
      {loading ? (
        <Skeleton variant="rectangular" width={200} height={40} sx={{ mb: 3 }} />
      ) : (
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {item.contact && (
            <Button variant="contained" color="primary" startIcon={<CallIcon />} href={`tel:${item.contact}`}>
              Call Now
            </Button>
          )}
          {item.whatsapp && (
            <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/${item.whatsapp}`}>
              WhatsApp
            </Button>
          )}
          {item.website && (
            <Button variant="contained" color="info" startIcon={<LanguageIcon />} href={item.website} target="_blank">
              Visit Website
            </Button>
          )}
        </Box>
      )}

      {/* Address */}
      {loading ? (
        <Skeleton variant="text" width="60%" height={30} />
      ) : item?.address && (
        <>
          <Typography variant="h6" gutterBottom>Address</Typography>
          <Typography variant="body2" paragraph>{item.address}</Typography>
        </>
      )}

      {/* Google Map */}
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={300} />
      ) : item?.mapEmbed && (
        <Box sx={{ mb: 4 }}>
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
      )}

      {/* User Reviews (placeholder) */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>User Reviews</Typography>
        <Typography variant="body2" color="text.secondary">
          Reviews coming soon...
        </Typography>
      </Box>

      {/* Nearby Attractions (placeholder) */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Nearby Attractions</Typography>
        <Typography variant="body2" color="text.secondary">
          We'll soon show nearby attractions around this location.
        </Typography>
      </Box>
    </Container>
  );
}
