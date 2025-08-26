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
  IconButton,
  Stack,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Mapping of categoryId → human-readable name
const CATEGORY_MAP = {
  gyms_fitness: "Gyms & Fitness",
  hotels_stays: "Hotels & Stays",
  restaurants_cafes: "Restaurants & Cafes",
  tourist_attractions: "Tourist Attractions",
  festivals_events: "Festivals & Events",
  shopping_markets: "Shopping & Markets",
  education: "Education",
  healthcare: "Healthcare",
  transportation: "Transportation",
  food_streets: "Street Foods (Food Streets)",
  movie_theaters: "Movie Theaters",
  parks: "Parks",
  playgrounds: "Playgrounds",
  entertainment: "Entertainment (Bowling, Snooker, Etc)",
  libraries: "Libraries",
  coworking_spaces: "Co-working Spaces",
  religious_places: "Religious Places",
  cultural_centers: "Cultural Centers / Museums",
  salons_beauty: "Salons & Beauty Services",
  laundry: "Laundry & Dry Cleaning",
  repair_services: "Repair Services (Electronics, Appliances)",
  plumbing_electrical: "Plumbing & Electrical Services",
  pet_services: "Pet Services (Vets, Grooming)",
  automobile_services: "Automobile Services (Garages, Car Washes)",
  tech_electronics: "Tech & Electronics Stores",
  emergency_contacts: "Emergency Contacts (Police, Ambulance, Fire)",
  wellness_spas: "Wellness & Spas",
  sports_clubs: "Sports Clubs / Academies",
};

// Fixed fields exactly like the PDF
const DEFAULT_FIELDS = {
  name: "",
  description: "",
  category: "", // human-readable name
  address: "",
  rating: "",
  website: "",
  contact: "",
  whatsapp: "",
  image: "",
  gallery: "", // CSV text input for quick edits
  mapurl: "", // we’ll also mirror to mapEmbed on save
  featured: "FALSE",
  eyes: "FALSE",
};

const tf = (v) =>
  v === true || v === "1" || v === 1 || String(v).toUpperCase() === "TRUE"
    ? "TRUE"
    : "FALSE";

// turn any non-primitive into a readable string for preview
const safeDisplay = (v) => {
  if (v == null) return "-";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

// normalize incoming Firestore data to the shape the form expects
const normalizeLoadedData = (data, categoryName) => {
  // gallery may be:
  // - string (leave as is)
  // - array of strings (join)
  // - array of objects with { placePhotoName, ... } (join names)
  let galleryStr = "";
  let galleryObjects = [];
  if (Array.isArray(data.gallery)) {
    galleryObjects = data.gallery.map((g) =>
      typeof g === "string"
        ? { placePhotoName: g, widthPx: "", heightPx: "" }
        : {
            placePhotoName: g?.placePhotoName || "",
            widthPx: g?.widthPx ?? "",
            heightPx: g?.heightPx ?? "",
          }
    );
    const parts = galleryObjects.map((g) => g.placePhotoName).filter(Boolean);
    galleryStr = parts.join(", ");
  } else if (typeof data.gallery === "string") {
    galleryStr = data.gallery;
  }

  // prefer mapEmbed when present
  const mapurl = data.mapurl || data.mapEmbed || "";

  return {
    baseFields: {
      ...DEFAULT_FIELDS,
      ...data,
      category: categoryName,
      gallery: galleryStr,
      mapurl,
      featured: tf(data.featured),
      eyes: tf(data.eyes),
      rating:
        data.rating === undefined || data.rating === null
          ? ""
          : String(data.rating),
    },
    galleryObjects,
  };
};

const emptyGalleryRow = { placePhotoName: "", widthPx: "", heightPx: "" };

const ListingForm = () => {
  const { categoryId, listingId } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [galleryRows, setGalleryRows] = useState([emptyGalleryRow]);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Resolve human-readable category name
  const categoryName = CATEGORY_MAP[categoryId] || categoryId;

  useEffect(() => {
    if (!listingId) {
      // For new listings, prefill the category name
      setFields((prev) => ({ ...prev, category: categoryName }));
      setGalleryRows([emptyGalleryRow]);
      return;
    }
    (async () => {
      const ref = doc(db, categoryId, listingId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() || {};
        const { baseFields, galleryObjects } = normalizeLoadedData(
          data,
          categoryName
        );
        setFields(baseFields);
        setGalleryRows(
          galleryObjects.length ? galleryObjects : [emptyGalleryRow]
        );
      }
    })();
  }, [listingId, categoryId, categoryName]);

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const handleGalleryRowChange = (index, key, value) => {
    setGalleryRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addGalleryRow = () =>
    setGalleryRows((prev) => [...prev, { ...emptyGalleryRow }]);

  const removeGalleryRow = (index) =>
    setGalleryRows((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e = {};
    if (!fields.name.trim()) e.name = "Required";
    if (!fields.description.trim()) e.description = "Required";
    if (!fields.category) e.category = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
    // (you can add more validation as needed)
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Build gallery payload:
    // If galleryRows contain at least one row with placePhotoName, use object array.
    // Else fall back to CSV string from `fields.gallery`.
    const rowsWithName = galleryRows.filter(
      (r) => (r.placePhotoName || "").trim() !== ""
    );
    let galleryPayload = null;
    if (rowsWithName.length) {
      galleryPayload = rowsWithName.map((r) => ({
        placePhotoName: r.placePhotoName.trim(),
        // store numbers if valid, else omit
        ...(r.widthPx !== ""
          ? { widthPx: Number(r.widthPx) || r.widthPx }
          : {}),
        ...(r.heightPx !== ""
          ? { heightPx: Number(r.heightPx) || r.heightPx }
          : {}),
      }));
    } else if (fields.gallery.trim()) {
      galleryPayload = fields.gallery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      galleryPayload = [];
    }

    const payload = {
      ...fields,
      gallery: galleryPayload,
      categoryId, // machine-safe category id
      category: categoryName, // human-readable label
      rating:
        fields.rating === "" || isNaN(parseFloat(fields.rating))
          ? ""
          : Math.max(0, Math.min(5, parseFloat(fields.rating))),
      featured: tf(fields.featured),
      eyes: tf(fields.eyes),
      // mirror mapurl to mapEmbed for DetailPage compatibility
      mapEmbed: fields.mapurl || "",
    };

    if (listingId) {
      await updateDoc(doc(db, categoryId, listingId), payload);
    } else {
      await addDoc(collection(db, categoryId), {
        ...payload,
        date: new Date().toISOString().split("T")[0],
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

            {/* Category (read-only, resolved from URL) */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Category"
                fullWidth
                value={categoryName}
                InputProps={{ readOnly: true }}
              />
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

            {/* Gallery (CSV quick edit) */}
            <Grid item xs={12} display={"contents"}>
              <TextField
                label="Gallery (comma separated URLs or photo names)"
                fullWidth
                value={fields.gallery}
                onChange={(e) => handleChange("gallery", e.target.value)}
              />
            </Grid>

            {/* Advanced Gallery Editor (array of objects) */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Advanced Gallery Editor
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Use this to save gallery as objects (placePhotoName, widthPx,
                heightPx). If you fill at least one row here, the CSV above will
                be ignored on save.
              </Typography>

              {galleryRows.map((row, idx) => (
                <Stack
                  key={idx}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <TextField
                    label="placePhotoName"
                    fullWidth
                    value={row.placePhotoName}
                    onChange={(e) =>
                      handleGalleryRowChange(
                        idx,
                        "placePhotoName",
                        e.target.value
                      )
                    }
                  />
                  <TextField
                    label="widthPx"
                    type="number"
                    sx={{ minWidth: 120 }}
                    value={row.widthPx}
                    onChange={(e) =>
                      handleGalleryRowChange(idx, "widthPx", e.target.value)
                    }
                  />
                  <TextField
                    label="heightPx"
                    type="number"
                    sx={{ minWidth: 120 }}
                    value={row.heightPx}
                    onChange={(e) =>
                      handleGalleryRowChange(idx, "heightPx", e.target.value)
                    }
                  />
                  <IconButton
                    aria-label="remove photo row"
                    onClick={() => removeGalleryRow(idx)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                color="secondary"
                onClick={addGalleryRow}
                sx={{ mt: 0.5 }}
              >
                Add Photo Row
              </Button>
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
                    {safeDisplay(v)}
                  </Typography>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  gallery (object rows)
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {safeDisplay(galleryRows)}
                </Typography>
              </Grid>
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
