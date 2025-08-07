import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Add, Edit, Delete } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ManageListings() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const snapshot = await getDocs(collection(db, categoryId));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(data);
    };

    fetchListings();
  }, [categoryId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    await deleteDoc(doc(db, categoryId, id));
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => navigate(`/admin/`)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => navigate(`/admin/${categoryId}/listings/new`)}
        >
          Add Listing
        </Button>
      </Box>
      <Typography variant="h5" fontWeight="bold">
        {categoryId.replace(/_/g, " ").slice(0, 1).toUpperCase() +
          categoryId.replace(/_/g, " ").slice(1)}{" "}
        Listings
      </Typography>
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
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>{listing.name || "—"}</TableCell>
              <TableCell>
                {listing.description?.length > 80
                  ? listing.description.slice(0, 80) + "..."
                  : listing.description || "—"}
              </TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton
                    color="secondary"
                    onClick={() =>
                      navigate(
                        `/admin/${categoryId}/listings/${listing.id}/edit`
                      )
                    }
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
