import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { db } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

export default function ListingForm() {
  const { categoryId, listingId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [extraFields, setExtraFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [isEditMode, setIsEditMode] = useState(!!listingId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (listingId) {
        try {
          const ref = doc(db, categoryId, listingId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setFormData({
              ...data,
              date: data.date || new Date().toISOString().split("T")[0],
            });

            const knownKeys = ["name", "description", "date"];
            const dynamicFields = Object.keys(data)
              .filter((key) => !knownKeys.includes(key))
              .map((key) => ({ key, value: data[key] }));
            setExtraFields(dynamicFields);
          }
        } catch (err) {
          console.error("Error loading listing:", err);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [categoryId, listingId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleExtraChange = (index, value) => {
    const updated = [...extraFields];
    updated[index].value = value;
    setExtraFields(updated);
  };

  const handleAddField = () => {
    const key = newFieldName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) return alert("Please enter a valid field name.");
    if (
      ["name", "description", "date"].includes(key) ||
      extraFields.some((f) => f.key === key)
    ) {
      return alert("Field already exists or is reserved.");
    }

    setExtraFields([...extraFields, { key, value: "" }]);
    setNewFieldName("");
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      date: formData.date || new Date().toISOString().split("T")[0],
    };
    extraFields.forEach((field) => {
      payload[field.key] = field.value;
    });

    try {
      if (isEditMode) {
        await updateDoc(doc(db, categoryId, listingId), payload);
      } else {
        await addDoc(collection(db, categoryId), payload);
      }
      navigate(`/admin/${categoryId}/listings`);
    } catch (err) {
      console.error("Error saving listing:", err);
      alert("Failed to save listing.");
    }
  };

  if (loading) return <Typography p={4}>Loading form...</Typography>;

  return (
    <Box p={4} bgcolor="#f7f9fc" minHeight="100vh">
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate(`/admin/${categoryId}/listings`)}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? "Edit Listing" : "Add New Listing"}
        </Typography>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Listing Information"
          titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
          sx={{ bgcolor: "#e3f2fd" }}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                disabled
                value={formData.date}
              />
            </Grid>

            {/* New Field Adder */}
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={2}>
                <TextField
                  label="Field Name"
                  fullWidth
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleAddField}
                >
                  Add Field
                </Button>
              </Box>
            </Grid>

            {/* Dynamic Fields */}
            {extraFields.map((field, index) => (
              <Grid item xs={12} md={6} key={field.key}>
                <TextField
                  label={field.key.replace(/_/g, " ").toUpperCase()}
                  fullWidth
                  value={field.value}
                  onChange={(e) => handleExtraChange(index, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/admin/${categoryId}/listings`)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
            >
              {isEditMode ? "Update Listing" : "Create Listing"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
