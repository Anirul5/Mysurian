import {
  doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const logSearch = async (category, term = "") => {
  if (!category) return;

  try {
    // Log full search with timestamp
    await addDoc(collection(db, "searchLogs"), {
      category: category.toLowerCase(),
      term: term.toLowerCase(),
      timestamp: serverTimestamp(),
    });

    // 🔥 Only increment analytics for the CATEGORY
    const analyticsRef = doc(db, "searchAnalytics", category.toLowerCase());
    const docSnap = await getDoc(analyticsRef);

    if (docSnap.exists()) {
      await updateDoc(analyticsRef, { count: increment(1) });
    } else {
      await setDoc(analyticsRef, { count: 1 });
    }

  } catch (err) {
    console.error("Search logging failed:", err);
  }
};

