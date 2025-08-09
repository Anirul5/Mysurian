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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageForCategory: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();
  const storage = getStorage();

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
        imageForCategory: category.imageForCategory || "",
      });
    } else {
      setEditId(null);
      setFormData({ name: "", description: "", imageForCategory: "" });
    }
    setImageFile(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a category name.");
      return;
    }

    const docId = formData.name.toLowerCase().replace(/\s+/g, "_");

    try {
      let imageUrl = formData.imageForCategory;

      if (imageFile) {
        const storageRef = ref(storage, `categoryImages/${docId}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editId) {
        await updateDoc(doc(db, "categories", editId), {
          name: formData.name,
          description: formData.description,
          imageForCategory: imageUrl,
        });
        console.log("Category updated successfully!");
      } else {
        const existingDoc = await getDoc(doc(db, "categories", docId));
        if (existingDoc.exists()) {
          alert("Category with the same name already exists.");
          return;
        }
        await setDoc(doc(db, "categories", docId), {
          name: formData.name,
          description: formData.description,
          imageForCategory: imageUrl,
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
      const listingSnapshot = await getDocs(collection(db, categoryId));
      const deletePromises = listingSnapshot.docs.map((docItem) =>
        deleteDoc(doc(db, categoryId, docItem.id))
      );
      await Promise.all(deletePromises);
      console.log(`Deleted all listings in /${categoryId}`);

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
      fetchCategories();
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
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

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Description</strong>
            </TableCell>
            <TableCell>
              <strong>Image</strong>
            </TableCell>
            <TableCell>
              <strong>Edit Schema</strong>
            </TableCell>
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell>
                {cat.imageForCategory && (
                  <img
                    src={cat.imageForCategory}
                    alt={cat.name}
                    style={{
                      width: 80,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                )}
              </TableCell>
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Box mt={2}>
            <Typography variant="subtitle1">Category Image</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImageFile(e.target.files[0]);
                setFormData({ ...formData, imageForCategory: "" });
              }}
            />
            {(formData.imageForCategory || imageFile) && (
              <Box mt={1}>
                <img
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : formData.imageForCategory
                  }
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}
          </Box>
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
