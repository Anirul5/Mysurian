import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// EXACT categories from your PDF
const CATEGORY_OPTIONS = [
  "Gyms & Fitness",
  "Hotels & Stays",
  "Restaurants & Cafes",
  "Tourist Attractions",
  "Festivals & Events",
  "Shopping & Markets",
  "Education",
  "Healthcare",
  "Transportation",
  "Street Foods (Food Streets)",
  "Movie Theaters",
  "Parks",
  "Playgrounds",
  "Entertainment (Bowling, Snooker, Etc)",
  "Libraries",
  "Co-working Spaces",
  "Religious Places",
  "Cultural Centers / Museums",
  "Salons & Beauty Services",
  "Laundry & Dry Cleaning",
  "Repair Services (Electronics, Appliances)",
  "Plumbing & Electrical Services",
  "Pet Services (Vets, Grooming)",
  "Automobile Services (Garages, Car Washes)",
  "Tech & Electronics Stores",
  "Emergency Contacts (Police, Ambulance, Fire)",
  "Wellness & Spas",
  "Sports Clubs / Academies",
];

// Fixed fields exactly like the PDF
const DEFAULT_FIELDS = {
  name: "",
  description: "",
  category: "",
  address: "", // LONG TEXT
  rating: "",
  website: "",
  contact: "",
  whatsapp: "",
  image: "",
  gallery: "",
  mapurl: "",
  featured: "FALSE", // TRUE/FALSE dropdown
  eyes: "FALSE", // TRUE/FALSE dropdown
};

const tf = (v) =>
  v === true || v === "1" || v === 1 || String(v).toUpperCase() === "TRUE"
    ? "TRUE"
    : "FALSE";

const ListingForm = () => {
  const { categoryId, listingId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!listingId) return;
    (async () => {
      const ref = doc(db, categoryId, listingId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() || {};
        setFields({
          ...DEFAULT_FIELDS,
          ...data,
          featured: tf(data.featured),
          eyes: tf(data.eyes),
          rating:
            data.rating === undefined || data.rating === null
              ? ""
              : String(data.rating),
        });
      }
    })();
  }, [listingId, categoryId]);

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!fields.name.trim()) e.name = "Required";
    if (!fields.description.trim()) e.description = "Required";
    if (!fields.category) e.category = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      ...fields,
      // ensure rating is numeric within 0–5 (or saved empty)
      rating:
        fields.rating === "" || isNaN(parseFloat(fields.rating))
          ? ""
          : Math.max(0, Math.min(5, parseFloat(fields.rating))),
      // keep booleans exactly as strings "TRUE"/"FALSE"
      featured: tf(fields.featured),
      eyes: tf(fields.eyes),
    };

    if (listingId) {
      await updateDoc(doc(db, categoryId, listingId), payload);
    } else {
      await addDoc(collection(db, categoryId), {
        ...payload,
        date: new Date().toISOString().split("T")[0], // you can remove if not needed
      });
    }
    navigate(`/admin/${categoryId}/listings`);
  };

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        color="secondary"
        onClick={() => navigate(`/admin/${categoryId}/listings`)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {listingId ? "Edit Listing" : "Add New Listing"}
      </Typography>

      <Paper
        sx={{
          px: { xs: 2, sm: 3 },
          py: 3,
          borderRadius: 2,
          mb: 3,
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        {!previewMode ? (
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Name"
                fullWidth
                required
                value={fields.name}
                error={Boolean(errors.name)}
                helperText={errors.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                value={fields.description}
                error={Boolean(errors.description)}
                helperText={errors.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Category"
                select
                fullWidth
                required
                value={fields.category}
                error={Boolean(errors.category)}
                helperText={errors.category}
                onChange={(e) => handleChange("category", e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">{/* <em>Select Category</em> */}</MenuItem>
                {CATEGORY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Address */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={fields.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Grid>

            {/* Website */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Website"
                fullWidth
                value={fields.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </Grid>

            {/* Contact */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Contact"
                fullWidth
                value={fields.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
              />
            </Grid>

            {/* WhatsApp */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="WhatsApp"
                fullWidth
                value={fields.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Image URL"
                fullWidth
                value={fields.image}
                onChange={(e) => handleChange("image", e.target.value)}
              />
            </Grid>

            {/* Gallery */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Gallery (comma separated URLs)"
                fullWidth
                value={fields.gallery}
                onChange={(e) => handleChange("gallery", e.target.value)}
              />
            </Grid>

            {/* Map URL */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Map URL"
                fullWidth
                value={fields.mapurl}
                onChange={(e) => handleChange("mapurl", e.target.value)}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={12}>
              <TextField
                label="Rating (0–5)"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                fullWidth
                value={fields.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
              />
            </Grid>

            {/* Featured */}
            <Grid item xs={12}>
              <TextField
                label="Featured"
                select
                fullWidth
                value={fields.featured}
                onChange={(e) => handleChange("featured", e.target.value)}
              >
                <MenuItem value="TRUE">TRUE</MenuItem>
                <MenuItem value="FALSE">FALSE</MenuItem>
              </TextField>
            </Grid>

            {/* Eyes */}
            <Grid item xs={12}>
              <TextField
                label="Eyes"
                select
                fullWidth
                value={fields.eyes}
                onChange={(e) => handleChange("eyes", e.target.value)}
              >
                <MenuItem value="TRUE">TRUE</MenuItem>
                <MenuItem value="FALSE">FALSE</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Listing Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(fields).map(([k, v]) => (
                <Grid item xs={12} key={k}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {k}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {v || "-"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

      <Box display="flex" gap={2} justifyContent="center">
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setPreviewMode((p) => !p)}
        >
          {previewMode ? "Back to Edit" : "Preview Listing"}
        </Button>
        {!previewMode && (
          <Button variant="contained" color="secondary" onClick={handleSubmit}>
            {listingId ? "Update Listing" : "Submit Listing"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ListingForm;
