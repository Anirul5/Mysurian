import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  collection,
  addDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { loginWithGoogle } from "../firebase/auth";

export default function Reviews({ categoryId, itemId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogComment, setDialogComment] = useState("");

  useEffect(() => {
    if (!categoryId || !itemId) return;

    const q = query(
      collection(db, "categories", categoryId, "items", itemId, "reviews"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (currentUser) {
        const userReview = fetched.find((r) => r.uid === currentUser.uid);
        const others = fetched.filter((r) => r.uid !== currentUser.uid);
        fetched = userReview ? [userReview, ...others] : others;
      }

      setReviews(fetched);
    });

    return () => unsubscribe();
  }, [categoryId, itemId, currentUser]);

  const handleAddReview = async () => {
    let user = currentUser;
    if (!user) {
      try {
        user = await loginWithGoogle();
      } catch (err) {
        console.error("Login required", err);
        return;
      }
    }

    if (!newComment.trim()) return;

    const existing = reviews.find((r) => r.uid === user.uid);

    if (existing) {
      const reviewRef = doc(
        db,
        "categories",
        categoryId,
        "items",
        itemId,
        "reviews",
        existing.id
      );
      await updateDoc(reviewRef, {
        comment: newComment,
        date: new Date(),
      });
    } else {
      await addDoc(
        collection(db, "categories", categoryId, "items", itemId, "reviews"),
        {
          comment: newComment,
          user: user.displayName || "Anonymous",
          uid: user.uid,
          date: new Date(),
        }
      );
    }

    setNewComment("");
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setEditingComment(review.comment);
  };

  const handleSaveEdit = async () => {
    const reviewRef = doc(
      db,
      "categories",
      categoryId,
      "items",
      itemId,
      "reviews",
      editingId
    );
    await updateDoc(reviewRef, {
      comment: editingComment,
      date: new Date(),
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const reviewRef = doc(
      db,
      "categories",
      categoryId,
      "items",
      itemId,
      "reviews",
      id
    );
    await deleteDoc(reviewRef);
  };

  const openFullComment = (comment) => {
    setDialogComment(comment);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        User Comments ({reviews.length})
      </Typography>

      <Box
        style={{ display: "flex", overflowX: "auto", gap: 2, paddingBottom: 2 }}
      >
        {reviews.map((r) => (
          <Card
            key={r.id}
            style={{
              minWidth: 250,
              flexShrink: 0,
              padding: 1,
              border:
                currentUser?.uid === r.uid
                  ? "2px solid #1976d2"
                  : "1px solid #ccc",
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                style={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                {r.user}
              </Typography>
              {editingId === r.id ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveEdit}
                    style={{ marginTop: 8 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setEditingId(null)}
                    style={{ marginTop: 8 }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    style={{
                      fontSize: "0.9rem",
                      marginTop: 8,
                      maxWidth: 220,
                      maxHeight: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      cursor: "pointer",
                    }}
                    onClick={() => openFullComment(r.comment)}
                  >
                    {r.comment}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    style={{ fontSize: "0.75rem", marginTop: 4 }}
                  >
                    {r.date?.toDate
                      ? r.date.toDate().toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })
                      : ""}
                  </Typography>
                  {currentUser?.uid === r.uid && (
                    <Box style={{ display: "flex", gap: 1, marginTop: 8 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(r)}
                        style={{ padding: 4 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: 4 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add/Edit form */}
      <Box sx={{ mt: 3 }}>
        {currentUser ? (
          <>
            <Typography variant="subtitle1">
              {reviews.find((r) => r.uid === currentUser?.uid)
                ? "Update Your Comment"
                : "Write a Comment"}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#fafafa",
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#bbb" },
                  "&.Mui-focused fieldset": { borderColor: "transparent" },
                  "&.Mui-focused": {
                    backgroundColor: "#fff",
                    boxShadow: "0 0 6px rgba(0,0,0,0.15)",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 1 }}
              onClick={handleAddReview}
            >
              {reviews.find((r) => r.uid === currentUser?.uid)
                ? "Update Comment"
                : "Submit"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 1 }}
            onClick={loginWithGoogle}
          >
            Login to write a comment
          </Button>
        )}
      </Box>

      {/* Full comment dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Full Comment</DialogTitle>
        <DialogContent>
          <Typography>{dialogComment}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
