import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";

export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Open modal for Add/Edit
  const handleOpen = (category = null) => {
    if (category) {
      setEditId(category.name);
      setFormData({ name: category.name || "", description: category.description || "" });
    } else {
      setEditId(null);
      setFormData({ name: "", description: "" });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Save or Update category in Firestore
  const handleSave = async () => {
    console.log("Saving data:", formData, "Edit ID:", editId);

    // Basic validation
    if (!formData.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    try {
      if (editId) {
        // Update existing category
        await updateDoc(doc(db, "categories", editId), {
          name: formData.name,
          description: formData.description
        });
        console.log("Category updated successfully!");
      } else {
        // Add new category
        await addDoc(collection(db, "categories"), {
          name: formData.name,
          description: formData.description
        });
        console.log("Category added successfully!");
      }
      fetchCategories();
      handleClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Check console for details.");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        console.log("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Manage Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      {/* Category Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleOpen(cat)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() =>
                    navigate(`/admin/${cat.id}/listings`, {
                      state: { categoryName: cat.name }
                    })
                  }
                >
                  <ListIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
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
