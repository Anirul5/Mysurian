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
import { getAuth } from "firebase/auth"; // ⬅️ added
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// TipTap (React 19 friendly)
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/* ----------------------------- Utilities ----------------------------- */

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
  description: "", // now HTML from TipTap
  category: "", // human-readable name
  address: "",
  rating: "",
  website: "",
  contact: "",
  whatsapp: "",
  image: "",
  gallery: "", // CSV text input for quick edits
  mapurl: "", // stored and mirrored to mapEmbed
  featured: "FALSE",
  eyes: "FALSE",
  hero: "FALSE",
  heroOrder: "",
};

const tf = (v) =>
  v === true || v === "1" || v === 1 || String(v).toUpperCase() === "TRUE"
    ? "TRUE"
    : "FALSE";

// Extract src if user pasted a full <iframe ...>, otherwise return the value
const extractEmbedSrc = (raw) => {
  if (!raw) return "";
  const m = /<iframe[^>]*\s+src=["']([^"']+)["']/i.exec(raw);
  return (m ? m[1] : raw).trim();
};

// Normalize to a clean Google Maps embed URL (keyed or keyless)
const normalizeMapInput = (raw) => extractEmbedSrc(raw);

// Validate we only accept Google Maps embed endpoints
const isValidMapsEmbedUrl = (url) =>
  /^https:\/\/www\.google\.com\/maps\/embed(?:\/v1\/|)\S+$/i.test(url);

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

// convert HTML to plain text to validate required-ness
const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

// normalize incoming Firestore data to the shape the form expects
const normalizeLoadedData = (data, categoryName) => {
  // gallery may be: string / array of strings / array of objects
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

/* --------------------------- Map Preview UI --------------------------- */

const MapPreview = ({ url }) => {
  if (!url || !isValidMapsEmbedUrl(url)) return null;
  return (
    <Box
      sx={{
        mt: 1,
        width: "100%",
        height: 240,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map preview"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </Box>
  );
};

/* ------------------------------ TipTap UI ------------------------------ */

function RichEditor({ value, onChange, error }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Link.configure({ openOnClick: true, autolink: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: error ? "error.main" : "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Minimal toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        {[
          ["Bold", () => editor?.chain().focus().toggleBold().run()],
          ["Italic", () => editor?.chain().focus().toggleItalic().run()],
          [
            "H1",
            () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
          ],
          [
            "H2",
            () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          ],
          ["Bullet", () => editor?.chain().focus().toggleBulletList().run()],
          ["Number", () => editor?.chain().focus().toggleOrderedList().run()],
          ["Quote", () => editor?.chain().focus().toggleBlockquote().run()],
          [
            "Link",
            () => {
              const url = prompt("Enter URL");
              if (url)
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
            },
          ],
          [
            "Clear",
            () => editor?.chain().focus().clearNodes().unsetAllMarks().run(),
          ],
        ].map(([label, fn]) => (
          <Button
            key={label}
            size="small"
            variant="outlined"
            color="secondary"
            onClick={fn}
          >
            {label}
          </Button>
        ))}
      </Box>

      <EditorContent
        editor={editor}
        className="tiptap"
        style={{ minHeight: 180, padding: 12 }}
      />
    </Box>
  );
}

/* ------------------------------- Component ------------------------------ */

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
      setFields((prev) => ({ ...prev, category: categoryName }));
      setGalleryRows([emptyGalleryRow]);
      return;
    }
    (async () => {
      try {
        const ref = doc(db, categoryId, listingId); // top-level {categoryId}/{listingId}
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
      } catch (e) {
        console.error("Failed to load listing:", e);
        alert("Failed to load listing.");
      }
    })();
  }, [listingId, categoryId, categoryName]);

  const handleChange = (key, value) => {
    if (key === "mapurl") {
      const cleaned = normalizeMapInput(value);
      setFields((prev) => ({ ...prev, mapurl: cleaned }));
      setErrors((prev) => ({
        ...prev,
        mapurl:
          cleaned === "" || isValidMapsEmbedUrl(cleaned)
            ? undefined
            : prev.mapurl || "Invalid Google Maps embed URL",
      }));
      return;
    }
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
    if (!stripHtml(fields.description)) e.description = "Required";
    if (!fields.category) e.category = "Required";
    if (fields.mapurl && !isValidMapsEmbedUrl(fields.mapurl)) {
      e.mapurl =
        "Please paste a Google Maps Embed URL (either /maps/embed?pb=... or /maps/embed/v1/...)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ⬇️ NEW: safe guard before writes
  async function ensureSignedInAndRefresh() {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) {
      alert("Please sign in as admin first.");
      throw new Error("Not signed in");
    }
    // Force refresh so latest custom claims are present
    await u.getIdToken(true);
    return u;
  }

  const handleSubmit = async () => {
    if (!validate()) return;

    // Build gallery payload
    const rowsWithName = galleryRows.filter(
      (r) => (r.placePhotoName || "").trim() !== ""
    );
    let galleryPayload = null;
    if (rowsWithName.length) {
      galleryPayload = rowsWithName.map((r) => ({
        placePhotoName: r.placePhotoName.trim(),
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
      categoryId,
      category: categoryName,
      rating:
        fields.rating === "" || isNaN(parseFloat(fields.rating))
          ? ""
          : Math.max(0, Math.min(5, parseFloat(fields.rating))),
      featured: tf(fields.featured),
      eyes: tf(fields.eyes),
      mapEmbed: fields.mapurl || "", // mirror for DetailPage
    };

    try {
      await ensureSignedInAndRefresh(); // ⬅️ make sure we have a user & fresh token

      if (listingId) {
        // top-level: {categoryId}/{listingId}
        await updateDoc(doc(db, categoryId, listingId), payload);
      } else {
        await addDoc(collection(db, categoryId), {
          ...payload,
          date: new Date().toISOString().split("T")[0],
        });
      }

      navigate(`/admin/${categoryId}/listings`);
    } catch (e) {
      console.error("Save failed:", e);
      // Give clearer messaging for common permission error:
      if (
        e?.code === "permission-denied" ||
        /insufficient permissions/i.test(e?.message || "")
      ) {
        alert(
          "Missing or insufficient permissions.\n\n" +
            "If this is an admin action, make sure your account is signed in and has admin rights, " +
            "and that your Firestore rules allow admin writes on this path."
        );
      } else if (e?.message === "Not signed in") {
        // already alerted above; no-op
      } else {
        alert("Save failed. Please try again.");
      }
    }
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

            {/* Description (TipTap) */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Description <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <RichEditor
                value={fields.description}
                onChange={(val) => handleChange("description", val)}
                error={Boolean(errors.description)}
              />
              {errors.description && (
                <Typography variant="caption" color="error">
                  {errors.description}
                </Typography>
              )}
            </Grid>

            {/* Category (read-only) */}
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

            {/* Advanced Gallery Editor */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Advanced Gallery Editor
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Fill at least one row to save as objects; otherwise the CSV will
                be used.
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
                    label="Image URL (https://...)"
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
                placeholder="Paste /maps/embed?pb=... or /maps/embed/v1/place?... or the full <iframe ...> code"
                fullWidth
                value={fields.mapurl}
                error={Boolean(errors.mapurl)}
                helperText={
                  errors.mapurl ||
                  "Tip: Paste Google Maps → Share → Embed → copy iframe. We'll extract the src automatically."
                }
                onChange={(e) => handleChange("mapurl", e.target.value)}
              />
              <MapPreview url={fields.mapurl} />
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
            {/* HeroHighlights */}
            <Grid item xs={12}>
              <TextField
                label="Hero Highlight"
                select
                fullWidth
                value={fields.hero}
                onChange={(e) => handleChange("eyes", e.target.value)}
              >
                <MenuItem value="TRUE">TRUE</MenuItem>
                <MenuItem value="FALSE">FALSE</MenuItem>
              </TextField>
            </Grid>
            {/* HeroOrder */}
            <Grid item xs={12}>
              <TextField
                label="Hero Highlights Order"
                fullWidth
                value={fields.heroOrder}
                onChange={(e) => handleChange("heroOrder", e.target.value)}
              />
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
