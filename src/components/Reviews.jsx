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
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { loginWithGoogle } from "../firebase/auth";

export default function Reviews({ categoryId, itemId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogComment, setDialogComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Admin detection (via custom claims) ---
  useEffect(() => {
    const auth = getAuth();
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) return setIsAdmin(false);
      try {
        const res = await user.getIdTokenResult(true); // force refresh claims
        setIsAdmin(!!res.claims?.admin);
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Firestore path: categories/{categoryId}/listings/{itemId}/reviews
  const reviewsCol = collection(
    db,
    "categories",
    categoryId,
    "listings",
    itemId,
    "reviews"
  );

  useEffect(() => {
    const q = query(reviewsCol, orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      if (currentUser) {
        const mine = list.filter((r) => r.uid === currentUser.uid);
        const others = list.filter((r) => r.uid !== currentUser.uid);
        setReviews([...mine, ...others]);
      } else {
        setReviews(list);
      }
    });

    return unsub;
  }, [categoryId, itemId, currentUser]);

  const ensureSignedIn = async () => {
    let user = currentUser || getAuth().currentUser;
    if (user) return user;
    user = await loginWithGoogle?.();
    return user;
  };

  const handlePostOrUpdate = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    const user = await ensureSignedIn();

    try {
      // ONE comment per user per item: docId == user.uid
      const ref = doc(
        db,
        "categories",
        categoryId,
        "listings",
        itemId,
        "reviews",
        user.uid
      );
      await setDoc(
        ref,
        {
          uid: user.uid,
          authorName: user.displayName || "Anonymous",
          authorPhoto: user.photoURL || "",
          comment: trimmed,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true } // update if exists, create if not
      );

      setNewComment("");
      setEditing(false);
    } catch (e) {
      alert(
        `Failed to post/update: ${e.code || "permission-denied"} — ${
          e.message || ""
        }`
      );
      console.error(e);
    }
  };

  const startEdit = (r) => {
    setNewComment(r.comment || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setNewComment("");
    setEditing(false);
  };

  const handleDelete = async (reviewId) => {
    try {
      // IMPORTANT: refresh token so admin claim is present for rules evaluation
      const auth = getAuth();
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }

      const ref = doc(
        db,
        "categories",
        categoryId,
        "listings",
        itemId,
        "reviews",
        reviewId
      );
      await deleteDoc(ref);
    } catch (e) {
      alert(
        `Delete failed: ${e.code || "permission-denied"} — ${e.message || ""}`
      );
      console.error("Delete failed:", e);
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
            {editing ? "Update Your Comment" : "Write a Comment"}
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
              {editing ? "Update" : "Post"}
            </Button>
            {editing && (
              <Button variant="outlined" color="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Horizontal scroll list */}
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", py: 1 }}>
        {reviews.map((r) => {
          const isOwner = currentUser?.uid === r.uid;
          return (
            <Card
              key={r.id}
              variant="outlined"
              sx={{ minWidth: 260, flex: "0 0 auto" }}
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
                  {/* Admin can ALWAYS delete; owner can edit/delete own */}
                  {isAdmin && !isOwner && (
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
                      ADMIN DELETE
                    </Button>
                  )}

                  {isOwner && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => startEdit(r)}
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
                  )}
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
