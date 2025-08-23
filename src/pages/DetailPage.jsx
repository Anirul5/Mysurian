import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Rating,
  Card,
  CardMedia,
  IconButton,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { ArrowBack } from "@mui/icons-material";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import useAllItems from "../hooks/useAllItems";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import FavoriteIcon from "@mui/icons-material/Favorite"; // filled heart
import NearbyAttractions from "../components/NearbyAttractions";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const category = location.pathname.split("/")[1];
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const { allItems, loading: allItemsLoading } = useAllItems();
  const hasIncremented = useRef(false);

  const placeholderImage =
    "https://images.unsplash.com/photo-1679239108020-aca50acd5f00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNpdHl8ZW58MHx8MHx8fDA%3D";
  const placeholderCover =
    "https://images.unsplash.com/photo-1679239108020-aca50acd5f00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNpdHl8ZW58MHx8MHx8fDA%3D";

  // Inside your component
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if current item is in user's favorites
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const favs = userSnap.data().favorites || [];
          setIsFavorite(favs.some((fav) => fav.id === id));
        }
      } else {
        setUser(null);
        setIsFavorite(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const itemData = {
      id,
      category,
      name: item.name,
      image: item.image || placeholderImage,
    };

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        favorites: [itemData],
      });
      setIsFavorite(true);
      return;
    }

    if (isFavorite) {
      await updateDoc(userRef, {
        favorites: arrayRemove(itemData),
      });
      setIsFavorite(false);
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(itemData),
      });
      setIsFavorite(true);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);

        const collectionName = decodeURIComponent(category);
        const docRef = doc(db, collectionName, id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          // Unique key for this listing
          const viewKey = `viewed-${collectionName}-${id}`;
          let addedViews = 0;

          if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, "true"); // ✅ set first
            await updateDoc(docRef, { views: increment(1) });
            addedViews = 1;
          }

          setItem({
            id: snapshot.id,
            category: collectionName,
            ...data,
            views: (data.views || 0) + addedViews,
          });
        } else {
          console.warn("Item not found");
          setItem(null);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [category, id]);

  const handleShare = () => {
    if (navigator.share && item) {
      navigator.share({
        title: item.name,
        text: `Check out ${item.name} in Mysuru`,
        url: window.location.href,
      });
    }
  };

  // FIX: Parse gallery from ["url1, url2, ..."] into a clean array
  const parseGallery = (gallery) => {
    if (!gallery) return [];

    if (typeof gallery === "string") {
      return gallery
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }

    if (Array.isArray(gallery)) {
      return gallery.map((url) => url.trim());
    }

    return [];
  };

  const galleryItems = parseGallery(item?.gallery);

  const isValidMapEmbed = (url) =>
    typeof url === "string" &&
    url.startsWith("https://www.google.com/maps/embed");

  const formattedCategory = category
    ?.replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? "Mysurian"
            : item?.name
            ? `${item.name} | ${formattedCategory} in Mysuru | Mysurian`
            : "Mysurian"}
        </title>
        <meta
          name="description"
          content={
            loading
              ? "Loading item details..."
              : item?.description ||
                `Details about ${item?.name || "this listing"}`
          }
        />
      </Helmet>
      {loading ? (
        <Container sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      ) : !item ? (
        <Container sx={{ mt: 4 }}>
          <Typography>Item not found</Typography>
        </Container>
      ) : (
        <Container sx={{ mt: 4 }}>
          {/* Breadcrumbs */}
          <Box mb={2}>
            <Breadcrumbs aria-label="breadcrumb">
              <Button
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={() => navigate(-1)}
                sx={{ mb: 2, display: { xs: "none", sm: "flex" } }}
              >
                Back
              </Button>
            </Breadcrumbs>
          </Box>

          {/* Cover Image */}
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={350}
              sx={{ borderRadius: 2, mb: 3 }}
            />
          ) : (
            <Box
              sx={{
                position: "relative",
                height: 350,
                overflow: "hidden",
                borderRadius: 2,
                mb: 3,
                "&:hover img": { transform: "scale(1.05)" },
              }}
            >
              <img
                src={item?.image || placeholderCover}
                alt={item?.name}
                onError={(e) => (e.target.src = placeholderCover)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top right, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  color: "#fff",
                  textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {item.name}
                </Typography>
                {item?.rating && (
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <Rating
                      value={item.rating}
                      precision={0.1}
                      readOnly
                      sx={{ color: "#fff" }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {item.rating} / 5
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <IconButton
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  sx={{ color: "#fff" }}
                >
                  <ShareIcon />
                </IconButton>
                <IconButton sx={{ color: "#fff" }}>
                  <IconButton
                    onClick={toggleFavorite}
                    sx={{ color: isFavorite ? "red" : "#fff" }}
                  >
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Gallery */}
          {galleryItems.length > 0 && (
            <>
              <Grid container spacing={2} mb={3}>
                {galleryItems.map((img, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      onClick={() => {
                        setPhotoIndex(index);
                        setLightboxOpen(true);
                      }}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 2,
                        overflow: "hidden",
                        "&:hover img": { transform: "scale(1.05)" },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={img || placeholderImage}
                        onError={(e) => (e.target.src = placeholderImage)}
                        alt={`${item.name} image ${index + 1}`}
                        sx={{
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {lightboxOpen && (
                <Lightbox
                  mainSrc={galleryItems[photoIndex]}
                  nextSrc={galleryItems[(photoIndex + 1) % galleryItems.length]}
                  prevSrc={
                    galleryItems[
                      (photoIndex + galleryItems.length - 1) %
                        galleryItems.length
                    ]
                  }
                  onCloseRequest={() => setLightboxOpen(false)}
                  onMovePrevRequest={() =>
                    setPhotoIndex(
                      (photoIndex + galleryItems.length - 1) %
                        galleryItems.length
                    )
                  }
                  onMoveNextRequest={() =>
                    setPhotoIndex((photoIndex + 1) % galleryItems.length)
                  }
                />
              )}
            </>
          )}

          {/* Description */}
          {loading ? (
            <Skeleton variant="text" width="100%" height={60} />
          ) : (
            item?.description && (
              <Typography variant="body2" paragraph>
                {item.description}
              </Typography>
            )
          )}

          {/* Contact Buttons */}
          {loading ? (
            <Skeleton
              variant="rectangular"
              width={180}
              height={38}
              sx={{ mb: 3, borderRadius: 2 }}
            />
          ) : (
            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
              {item.contact && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CallIcon />}
                  href={`tel:${item.contact}`}
                >
                  Call Now
                </Button>
              )}
              {item.whatsapp && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  href={`https://wa.me/${item.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Button>
              )}
              {item.website && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<LanguageIcon />}
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </Button>
              )}
            </Box>
          )}

          {/* Address */}
          {loading ? (
            <Skeleton variant="text" width="60%" height={25} />
          ) : (
            item?.address && (
              <>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body2" paragraph>
                  {item.address}
                </Typography>
              </>
            )
          )}

          {/* Map Embed */}
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: 2 }}
            />
          ) : isValidMapEmbed(item?.mapurl) ? (
            <Box sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
              <iframe
                src={item.mapurl}
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
            <Typography variant="h6" gutterBottom>
              User Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reviews coming soon...
            </Typography>
          </Box>

          {/* Nearby Attractions */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              {/* Nearby Attractions */}
            </Typography>
            <NearbyAttractions currentItem={item} />
          </Box>
        </Container>
      )}
    </>
  );
}
