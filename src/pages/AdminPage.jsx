import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { Edit, Delete } from "@mui/icons-material";


export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(list);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      setEditId(category.id);
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setEditId(null);
      setFormData({ name: "", description: "" });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    const docId = formData.name.toLowerCase().replace(/\s+/g, "_"); // sanitize name

    try {
      if (editId) {
        // update existing doc
        await updateDoc(doc(db, "categories", editId), {
          name: formData.name,
          description: formData.description,
        });
        console.log("Category updated successfully!");
      } else {
        // check for duplicate
        const existingDoc = await getDoc(doc(db, "categories", docId));
        if (existingDoc.exists()) {
          alert("Category with the same name already exists.");
          return;
        }

        // add new doc with custom ID
        await setDoc(doc(db, "categories", docId), {
          name: formData.name,
          description: formData.description,
        });
        console.log("Category added with ID:", docId);
      }

      fetchCategories();
      handleClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Check console for details.");
    }
  };


const deleteCategoryAndListings = async (categoryId) => {
  try {
    // 1. Delete all listings in the corresponding collection (e.g., /parks)
    const listingSnapshot = await getDocs(collection(db, categoryId));
    const deletePromises = listingSnapshot.docs.map((docItem) =>
      deleteDoc(doc(db, categoryId, docItem.id))
    );
    await Promise.all(deletePromises);
    console.log(`Deleted all listings in /${categoryId}`);

    // 2. Delete the category itself
    await deleteDoc(doc(db, "categories", categoryId));
    console.log(`Deleted category /categories/${categoryId}`);
  } catch (error) {
    console.error("Error deleting category and its listings:", error);
  }
};

const handleDelete = async (id) => {
  if (
    window.confirm(
      "Are you sure you want to delete this category and all its listings?"
    )
  ) {
    await deleteCategoryAndListings(id);
    fetchCategories(); // refresh UI
  }
};


  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Manage Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Category
        </Button>
      </Box>

      <Table>
  <TableHead>
    <TableRow>
      <TableCell><strong>Name</strong></TableCell>
      <TableCell><strong>Description</strong></TableCell>
      <TableCell><strong>Edit Schema</strong></TableCell>
      <TableCell><strong>Actions</strong></TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {categories.map((cat) => (
      <TableRow key={cat.id}>
        <TableCell>{cat.name}</TableCell>
        <TableCell>{cat.description}</TableCell>

        {/* ✅ NEW COLUMN: Edit Schema */}
        <TableCell>
          <IconButton
            color="secondary"
            onClick={() => navigate(`/admin/${cat.id}/schema`)}
          >
            <Edit />
          </IconButton>
        </TableCell>

        <TableCell>
          <IconButton color="primary" onClick={() => handleOpen(cat)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(cat.id)}>
            <Delete />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() =>
              navigate(`/admin/${cat.id}/listings`, {
                state: { categoryName: cat.name },
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
