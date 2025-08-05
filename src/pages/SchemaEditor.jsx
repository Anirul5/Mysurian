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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { db } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

const FIELD_TYPES = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "textarea", label: "Textarea" },
  { type: "url", label: "URL" },
  { type: "phone", label: "Phone" },
  { type: "rating", label: "Rating (0–5)" },
  { type: "date", label: "Date" },
];

const DEFAULT_FIELDS = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea", required: false },
  { key: "gallery", label: "Gallery (comma-separated URLs)", type: "textarea", required: false },
];

export default function SchemaEditor() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorySchema = async () => {
      const ref = doc(db, "categories", categoryId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const existingFields = snap.data().fields || [];
        if (existingFields.length === 0) {
          setIsFirstTime(true);
          setFields([...DEFAULT_FIELDS, ...FIELD_TYPES.map(ft => ({
            key: `${ft.type}_field`,
            label: ft.label,
            type: ft.type,
            required: false
          }))]);
        } else {
          setIsFirstTime(false);
          setFields(existingFields);
        }
      } else {
        // New category, set default + all field types
        setIsFirstTime(true);
        setFields([...DEFAULT_FIELDS, ...FIELD_TYPES.map(ft => ({
          key: `${ft.type}_field`,
          label: ft.label,
          type: ft.type,
          required: false
        }))]);
      }

      setLoading(false);
    };

    fetchCategorySchema();
  }, [categoryId]);

  const handleFieldChange = (index, key, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, [key]: value } : field
      )
    );
  };

  const addNewField = () => {
    setFields([
      ...fields,
      { key: "", label: "", type: "text", required: false },
    ]);
  };

  const removeField = (index) => {
    const fieldKey = fields[index].key;
    if (["name", "description", "gallery"].includes(fieldKey)) return;
    setFields(fields.filter((_, i) => i !== index));
  };

  const saveSchema = async () => {
    try {
      // filter out fields with empty key or label
      const cleaned = fields.filter(f => f.key.trim() && f.label.trim());

      await updateDoc(doc(db, "categories", categoryId), { fields: cleaned });
      alert("Schema saved successfully!");
      navigate(`/admin/${categoryId}/listings`);
    } catch (err) {
      console.error("Error saving schema:", err);
      alert("Failed to save schema.");
    }
  };

  if (loading) return <Typography p={4}>Loading schema...</Typography>;

  return (
    <Box p={4}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isFirstTime ? "Create Schema" : "Edit Schema"} for {categoryId}
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardHeader title="Custom Fields" sx={{ bgcolor: "#e3f2fd" }} />
        <CardContent>
          <Grid container spacing={3}>
            {fields.map((field, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Field Key"
                    fullWidth
                    value={field.key}
                    disabled={!isFirstTime || ["name", "description", "gallery"].includes(field.key)}
                    onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Label"
                    fullWidth
                    value={field.label}
                    disabled={!isFirstTime && ["name", "description", "gallery"].includes(field.key)}
                    onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    label="Type"
                    fullWidth
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                  >
                    {FIELD_TYPES.map((ft) => (
                      <MenuItem key={ft.type} value={ft.type}>
                        {ft.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    label="Required"
                    fullWidth
                    value={field.required ? "yes" : "no"}
                    onChange={(e) =>
                      handleFieldChange(index, "required", e.target.value === "yes")
                    }
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeField(index)}
                    disabled={["name", "description", "gallery"].includes(field.key)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>

          <Box mt={3}>
            <Button variant="outlined" onClick={addNewField}>
              Add New Field
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveSchema}>
              Save Schema
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
