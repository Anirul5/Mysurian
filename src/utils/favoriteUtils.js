// favoriteUtils.js
import { db } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const addFavorite = async (uid, itemId) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    favorites: arrayUnion(itemId),
  });
};

export const removeFavorite = async (uid, itemId) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    favorites: arrayRemove(itemId),
  });
};
