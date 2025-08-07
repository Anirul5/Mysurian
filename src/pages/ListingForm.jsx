import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { itemFieldTypes, typedOfFields } from "../utils/itemFieldTypes";
import Divider from "@mui/material/Divider";

const DEFAULT_FIELDS = {
  name: { value: "", type: "String", required: true },
  description: { value: "", type: "String", required: true },
  date: {
    value: new Date().toISOString().split("T")[0],
    type: "Date",
    required: false,
  },
  address: { value: "", type: "String", required: false },
  rating: { value: "", type: "Number", required: false },
  image: { value: "", type: "String", required: false },
  mapurl: { value: "", type: "String", required: false },
  gallery: { value: "", type: "String", required: false },
};

const ListingForm = () => {
  const { categoryId, listingId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState({});
  const [newField, setNewField] = useState({
    name: "",
    value: "",
    type: "String",
    required: false,
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (listingId) {
      const fetchListing = async () => {
        const docRef = doc(db, categoryId, listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedFields = {};
          Object.entries(data).forEach(([key, value]) => {
            let detectedType = typeof value;
            if (detectedType === "object" && value instanceof Date)
              detectedType = "Date";
            else if (value === "1" || value === "0") detectedType = "Boolean";
            loadedFields[key] = {
              value: value,
              type: itemFieldTypes[key]?.type || detectedType || "String",
              required: DEFAULT_FIELDS[key]?.required || false,
            };
          });
          setFields(loadedFields);
        }
      };
      fetchListing();
    } else {
      setFields(DEFAULT_FIELDS);
    }
  }, [listingId, categoryId]);

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const handleNewFieldAdd = () => {
    const { name, value, type, required } = newField;
    if (name && type) {
      setFields((prev) => ({
        ...prev,
        [name]: { value, type, required },
      }));
      setNewField({ name: "", value: "", type: "String", required: false });
    }
  };

  const handleSubmit = async () => {
    const data = {};
    for (const key in fields) {
      const { value, type } = fields[key];
      if (type === "Number") {
        data[key] = parseFloat(value) || 0;
      } else if (type === "Boolean") {
        data[key] = value === true || value === "1" || value === 1 ? "1" : "0";
      } else {
        data[key] = value;
      }
    }

    if (listingId) {
      await updateDoc(doc(db, categoryId, listingId), data);
    } else {
      await addDoc(collection(db, categoryId), {
        ...data,
        date: new Date().toISOString().split("T")[0],
      });
    }

    navigate(`/admin/${categoryId}/listings`);
  };

  const removeField = (key) => {
    const newFields = { ...fields };
    delete newFields[key];
    setFields(newFields);
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

      <Typography variant="h5" gutterBottom>
        {listingId ? "Edit Listing" : "Add New Listing"}
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(fields).map(([key, field]) => (
          <Grid item xs={12} sm={6} key={key}>
            {field.type === "Boolean" ? (
              <FormControlLabel
                control={
                  <Switch
                    color="secondary"
                    checked={field.value === true || field.value === "1"}
                    onChange={(e) => handleFieldChange(key, e.target.checked)}
                  />
                }
                label={key}
              />
            ) : (
              <TextField
                fullWidth
                label={key}
                type={field.type === "Number" ? "number" : "text"}
                inputProps={
                  field.type === "Number"
                    ? { inputMode: "decimal", step: "0.1", min: 0, max: 5 }
                    : {}
                }
                value={field.value}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                required={field.required}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => removeField(key)}>
                      <DeleteIcon />
                    </IconButton>
                  ),
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          Add New Field
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Field Name"
              fullWidth
              value={newField.name}
              onChange={(e) =>
                setNewField((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Value"
              fullWidth
              value={newField.value}
              onChange={(e) =>
                setNewField((prev) => ({ ...prev, value: e.target.value }))
              }
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Datatype"
              fullWidth
              select
              value={newField.type}
              onChange={(e) =>
                setNewField((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              {Object.values(typedOfFields).map((option) => (
                <MenuItem key={option.type} value={option.type}>
                  {option.type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              onClick={handleNewFieldAdd}
              variant="contained"
              color="secondary"
            >
              Add Field
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box mt={4}>
        {/* <Button variant="contained" color="secondary" onClick={handleSubmit}>
          {listingId ? "Update Listing" : "Save Listing"}
        </Button> */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit Mode" : "Preview Listing"}
            </Button>
            {!previewMode && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
              >
                {listingId ? "Update Listing" : "Submit Listing"}
              </Button>
            )}
          </Box>
        </Grid>

        {previewMode && (
          <Grid item xs={12}>
            <Box
              sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, mt: 2 }}
            >
              <Typography variant="h6">Preview</Typography>
              <pre>
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(fields).map(([k, v]) => [k, v.value])
                  ),
                  null,
                  2
                )}
              </pre>
            </Box>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ListingForm;
