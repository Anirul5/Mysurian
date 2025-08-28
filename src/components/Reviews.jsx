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
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { loginWithGoogle } from "../firebase/auth";

export default function Reviews({ categoryId, itemId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogComment, setDialogComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // === ADMIN DETECTION (custom claims) + DEBUG LOG ===
  useEffect(() => {
    const auth = getAuth();
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        // Force refresh to ensure the latest custom claims are present
        const res = await user.getIdTokenResult(true);
        console.log("Custom claims (debug):", res.claims); // <-- should include { admin: true } for admins
        setIsAdmin(!!res.claims?.admin);
      } catch (e) {
        console.error("Failed to read custom claims", e);
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Firestore collection path: categories/{categoryId}/items/{itemId}/reviews
  const reviewsCol = collection(
    db,
    "categories",
    categoryId,
    "items",
    itemId,
    "reviews"
  );

  useEffect(() => {
    const q = query(reviewsCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));

      // Keep your rule: show current user's review first
      if (currentUser) {
        const mine = list.filter((r) => r.uid === currentUser.uid);
        const others = list.filter((r) => r.uid !== currentUser.uid);
        setReviews([...mine, ...others]);
      } else {
        setReviews(list);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, itemId, currentUser]);

  const handlePostOrUpdate = async () => {
    let user = currentUser;
    if (!user) {
      try {
        user = await loginWithGoogle?.();
      } catch (err) {
        console.error("Login required", err);
        return;
      }
    }
    if (!newComment.trim()) return;

    const myExisting = reviews.find((r) => r.uid === user.uid);

    try {
      if (myExisting) {
        // Only owners can edit; admins do not edit (by design)
        const ref = doc(
          db,
          "categories",
          categoryId,
          "items",
          itemId,
          "reviews",
          myExisting.id
        );
        await updateDoc(ref, {
          comment: newComment.trim(),
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(reviewsCol, {
          uid: user.uid,
          authorName: user.displayName || "Anonymous",
          authorPhoto: user.photoURL || "",
          comment: newComment.trim(),
          createdAt: Date.now(),
        });
      }
      setNewComment("");
      setEditingId(null);
      setEditingComment("");
    } catch (e) {
      console.error("Failed to post/update review", e);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setNewComment(r.comment || "");
    setEditingComment(r.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewComment("");
    setEditingComment("");
  };

  const handleDelete = async (reviewId) => {
    try {
      const ref = doc(
        db,
        "categories",
        categoryId,
        "items",
        itemId,
        "reviews",
        reviewId
      );
      await deleteDoc(ref);
    } catch (e) {
      console.error("Delete failed:", e.code, e.message);
      alert(`Delete failed: ${e.code || "unknown"} — ${e.message || ""}`);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comments {isAdmin && <Chip label="ADMIN" size="small" sx={{ ml: 1 }} />}
      </Typography>

      {/* Write/Edit box */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {editingId ? "Update Your Comment" : "Write a Comment"}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePostOrUpdate}
            >
              {editingId ? "Update" : "Post"}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Horizontal scroll list of reviews */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          py: 1,
        }}
      >
        {reviews.map((r) => {
          const isOwner = currentUser?.uid === r.uid;

          return (
            <Card
              key={r.id}
              variant="outlined"
              sx={{ minWidth: 250, flex: "0 0 auto" }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  {r.authorName || "Anonymous"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setDialogComment(r.comment || "");
                    setOpenDialog(true);
                  }}
                >
                  {r.comment}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  {isAdmin ? (
                    // Admin: replace normal controls with a single red button
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        if (window.confirm("Admin: Delete this comment?")) {
                          handleDelete(r.id);
                        }
                      }}
                    >
                      ADMIN DELETE BUTTON
                    </Button>
                  ) : isOwner ? (
                    // Owner (non-admin): edit + delete icons
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(r)}
                        sx={{ p: 0.5 }}
                        aria-label="Edit comment"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm("Delete your comment?")) {
                            handleDelete(r.id);
                          }
                        }}
                        sx={{ p: 0.5 }}
                        aria-label="Delete comment"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
              </CardContent>
            </Card>
          );
        })}
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
