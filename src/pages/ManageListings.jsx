import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ManageListings() {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const categoryName = location.state?.categoryName || "Listings";

  const [listings, setListings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    mapEmbed: "",
    rating: "",
    contact: "",
    whatsapp: "",
    website: "",
    type: "",
    gallery: "",
    keywords: ""
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const snapshot = await getDocs(collection(db, categoryId));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setListings(list);
  };

  const handleOpen = (listing = null) => {
    if (listing) {
      setEditId(listing.id);
      setFormData({
        ...listing,
        gallery: listing.gallery ? listing.gallery.join(", ") : "",
        keywords: listing.keywords ? listing.keywords.join(", ") : ""
      });
    } else {
      setEditId(null);
      setFormData({
        name: "",
        description: "",
        address: "",
        mapEmbed: "",
        rating: "",
        contact: "",
        whatsapp: "",
        website: "",
        type: "",
        gallery: "",
        keywords: ""
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    const dataToSave = {
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      gallery: formData.gallery ? formData.gallery.split(",").map((url) => url.trim()) : [],
      keywords: formData.keywords ? formData.keywords.split(",").map((word) => word.trim().toLowerCase()) : []
    };

    if (editId) {
      await updateDoc(doc(db, categoryId, editId), dataToSave);
    } else {
      await addDoc(collection(db, categoryId), dataToSave);
    }
    fetchListings();
    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, categoryId, id));
      fetchListings();
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/admin")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Manage {categoryName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Listing
        </Button>
      </Box>

      {/* Listings Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Rating</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>{listing.name}</TableCell>
              <TableCell>{listing.description}</TableCell>
              <TableCell>{listing.rating}</TableCell>
              <TableCell>
                <IconButton color="secondary" onClick={() => handleOpen(listing)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(listing.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editId ? "Edit Listing" : "Add Listing"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" fullWidth value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={3}
            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <TextField margin="dense" label="Address" fullWidth value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <TextField margin="dense" label="Map Embed URL" fullWidth value={formData.mapEmbed}
            onChange={(e) => setFormData({ ...formData, mapEmbed: e.target.value })} />
          <TextField margin="dense" label="Rating" type="number" fullWidth value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
          <TextField margin="dense" label="Contact Number" fullWidth value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
          <TextField margin="dense" label="WhatsApp Number" fullWidth value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
          <TextField margin="dense" label="Website" fullWidth value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })} />

          <TextField
            margin="dense"
            label="Type"
            select
            fullWidth
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="Vegetarian">🟢 Vegetarian</MenuItem>
            <MenuItem value="Non-Vegetarian">🔴 Non-Vegetarian</MenuItem>
            <MenuItem value="Eggetarian">🟡 Eggetarian</MenuItem>
          </TextField>

          <TextField margin="dense" label="Gallery (comma-separated URLs)" fullWidth value={formData.gallery}
            onChange={(e) => setFormData({ ...formData, gallery: e.target.value })} />
          <TextField margin="dense" label="Keywords (comma-separated)" fullWidth value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
