import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  increment,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
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
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { onAuthStateChanged } from "firebase/auth";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import NearbyAttractions from "../components/NearbyAttractions";
import Reviews from "../components/Reviews";
import MapEmbed from "../components/MapEmbed";
import DOMPurify from "dompurify";

const placeholderImage =
  "https://images.unsplash.com/photo-1679239108020-aca50acd5f00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0";
const placeholderCover = placeholderImage;

/* ---------- Reusable Cover Image with Skeleton ---------- */
function CoverImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
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
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      <img
        src={error ? placeholderCover : src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.5s ease",
          display: loaded ? "block" : "none",
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
    </Box>
  );
}

function ThumbImage({ src, alt, height = 180 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{ position: "relative", height, overflow: "hidden" }}>
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      <img
        src={error ? placeholderImage : src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: loaded ? "block" : "none",
          transition: "transform 0.5s ease",
        }}
      />
    </Box>
  );
}

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const category = location.pathname.split("/")[1];

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // User + favorites
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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
    if (!item) return;

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
      await updateDoc(userRef, { favorites: arrayRemove(itemData) });
      setIsFavorite(false);
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(itemData) });
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

          // Unique per-listing view counter (session-scoped)
          const viewKey = `viewed-${collectionName}-${id}`;
          let addedViews = 0;
          if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, "true");
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

  /* ---- Parse gallery from your schema ---- */
  const getGalleryUrls = (gallery) => {
    if (!gallery) return [];
    if (Array.isArray(gallery)) {
      return gallery.map(resolveGallerySrc).filter(Boolean);
    }
    if (typeof gallery === "string") {
      return gallery
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^(https?:)?\/\//i.test(s));
    }
    return [];
  };

  // Resolve gallery item to a usable image URL.
  // Supports plain strings or objects with url/src/placePhotoName.
  // If it's already a URL, we use it; otherwise we skip (no API calls).
  const resolveGallerySrc = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item.trim();

    const val = item.url || item.src || item.placePhotoName || "";
    if (!val) return "";

    // only accept real URLs (no Places photoName → we avoid API calls)
    return /^(https?:)?\/\//i.test(val) ? val : "";
  };

  const galleryItems = getGalleryUrls(item?.gallery);
  const coverUrl = item?.image || galleryItems[0] || placeholderCover;

  const formattedCategory = category
    ?.replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
          {/* Breadcrumbs / Back */}
          <Box mb={0}>
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
          <Box sx={{ position: "relative" }}>
            <CoverImage src={coverUrl} alt={item?.name} />
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
              {typeof item?.rating === "number" && (
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Rating
                    value={item.rating}
                    precision={0.1}
                    readOnly
                    sx={{ color: "#fff" }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {item.rating} / 5
                    {typeof item.userRatingCount === "number" &&
                      ` · ${item.userRatingCount} reviews`}
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
              <IconButton
                onClick={toggleFavorite}
                sx={{ color: isFavorite ? "red" : "#fff" }}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Box>
          {/* Gallery */}
          {item.gallery.length > 0 && (
            <>
              <Grid container spacing={2} mb={3}>
                {console.log(item.galleryItems)}
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
                      <ThumbImage
                        src={img || placeholderImage}
                        alt={`${item.name} image ${index + 1}`}
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
          {/* Description (rich blog style) */}
          {item?.description && (
            <Box
              sx={{
                mt: 3,
                mb: 4,
                p: { xs: 2, sm: 3 },
                backgroundColor: "#fafafa",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                // blog styles
                "& h1,& h2,& h3": { fontWeight: 700, mt: 2.5, mb: 1 },
                "& h1": { fontSize: "1.6rem" },
                "& h2": { fontSize: "1.35rem" },
                "& h3": { fontSize: "1.15rem" },
                "& p": { lineHeight: 1.8, mb: 2 },
                "& ul, & ol": { pl: 3, mb: 2 },
                "& blockquote": {
                  borderLeft: "4px solid #e0e0e0",
                  pl: 2,
                  color: "text.secondary",
                  fontStyle: "italic",
                  my: 2,
                },
              }}
            >
              <div
                // sanitize any HTML from Firestore
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.description),
                }}
              />
            </Box>
          )}

          {/* Contact Buttons */}
          <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
            {item?.contact && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CallIcon />}
                href={`tel:${String(item.contact).replace(/\s+/g, "")}`}
              >
                Call Now
              </Button>
            )}
            {item?.whatsapp && (
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
            {item?.website && (
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

          {/* Address */}
          {item?.address && (
            <>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Typography variant="body2" paragraph>
                {item.address}
              </Typography>
            </>
          )}

          {/* Map Embed (supports both mapEmbed + legacy mapurl) */}
          {(item?.mapEmbed || item?.mapurl) && (
            <MapEmbed value={item.mapEmbed || item.mapurl} />
          )}

          {/* User Comments */}
          <Box mb={4}>
            <Reviews categoryId={category} itemId={id} currentUser={user} />
          </Box>

          {/* Nearby Attractions */}
          <Box mb={4}>
            <NearbyAttractions currentItem={item} />
          </Box>
        </Container>
      )}
    </>
  );
}
