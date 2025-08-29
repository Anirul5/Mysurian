import React, { useEffect, useState, Suspense } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  InputAdornment,
  Container,
  Button,
  Skeleton,
  Rating,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { categoryColors } from "../utils/categoryColors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";

const fallbackImage =
  "https://images.unsplash.com/photo-1618598827591-696673ab0abe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Replace with your fallback path

// Styled components (copied from CategoriesListPage)
const StyledCard = styled("div")(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#ffeede",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[6],
  },
  [theme.breakpoints.down("sm")]: {
    transform: "none", // disable hover shift on mobile
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500,
  padding: theme.spacing(1, 2),
}));

const CategoryPage = () => {
  const navigate = useNavigate();
  const { categoryName, categoryId } = useParams();
  const [allListings, setAllListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const categoryDoc = await getDoc(
          doc(db, "categories", categoryId || categoryName)
        );
        if (categoryDoc.exists()) {
          setCategoryImage(categoryDoc.data().imageForCategory || "");
        }

        const querySnapshot = await getDocs(collection(db, categoryName));
        const listings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllListings(listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [categoryName, categoryId]);

  const filteredListings = allListings.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColor = categoryColors[categoryName] || categoryColors.default;

  // pagination slice
  const paginatedListings = filteredListings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container sx={{ py: { xs: 2, sm: 2 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, sm: 2 },
          flexWrap: "wrap",
        }}
      >
        <StyledButton
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => navigate(-1)}
          sx={{
            display: { xs: "none", md: "flex" },
            mr: 2,
          }}
        >
          <Typography sx={{ fontWeight: "700" }}>Back</Typography>
        </StyledButton>
        <Typography
          variant="h4"
          align="center"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: "medium",
          }}
        >
          {categoryName
            .replaceAll("_", " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Typography>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // reset to page 1 on search
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="secondary" />
              </InputAdornment>
            ),
            sx: { borderRadius: "50px", backgroundColor: "#fff" },
          }}
        />
      </Box>

      {/* Listings Grid */}
      <Grid container spacing={2} justifyContent="center">
        {paginatedListings.length === 0 ? (
          <Grid item xs={12}>
            <Chip label={"No listings found"} color={"warning"} size="large" />
          </Grid>
        ) : (
          paginatedListings.map((listing) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              key={listing.id}
              sx={{ display: "flex", width: { xs: "80%", sm: 220 } }}
            >
              <Link
                to={`/${categoryName}/${listing.id}`}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <StyledCard>
                  <CardActionArea>
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={160}
                          animation="wave"
                        />
                      }
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          height: { xs: 120, sm: 140, md: 160 },
                          objectFit: "cover",
                          backgroundColor: "grey.100",
                        }}
                        image={listing.image || categoryImage || fallbackImage}
                        alt={listing.name || "Listing image"}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = categoryImage || fallbackImage;
                        }}
                      />
                    </Suspense>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        textAlign: "center",
                        p: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Typography
                        title={listing.name}
                        gutterBottom
                        sx={{
                          fontSize: {
                            xs: "0.9rem",
                            sm: "1rem",
                            md: "1.1rem",
                            lg: "1.2rem",
                          },
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "black",
                        }}
                      >
                        {listing.name}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.85rem",
                            md: "0.9rem",
                          },
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {stripHtml(listing.description) ||
                          "No description provided."}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={1}
                      >
                        {listing.rating && (
                          <Rating
                            name="read-only"
                            value={parseFloat(listing.rating)}
                            precision={0.5}
                            size="small"
                            readOnly
                          />
                        )}

                        {listing.date && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(listing.date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </Link>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {filteredListings.length > itemsPerPage && (
        <Box display="flex" justifyContent="center" mt={4} mb={2}>
          <Pagination
            count={Math.ceil(filteredListings.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="secondary"
            shape="rounded"
          />
        </Box>
      )}
    </Container>
  );
};

export default CategoryPage;
