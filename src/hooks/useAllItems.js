// src/hooks/useAllItems.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Memory cache for ultra-fast navigation
let cachedItems = null;

export default function useAllItems() {
  const [allItems, setAllItems] = useState(() => {
    // Load from sessionStorage if available
    const stored = sessionStorage.getItem("allItems");
    return stored ? JSON.parse(stored) : cachedItems || [];
  });
  const [loading, setLoading] = useState(allItems.length === 0);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        // Skip Firestore if already cached
        if (cachedItems || allItems.length > 0) return;

        // 1️⃣ Get all category names
        const catSnapshot = await getDocs(collection(db, "categories"));
        const categories = catSnapshot.docs.map((doc) => doc.id);

        let items = [];

        // 2️⃣ Fetch items from each category
        for (let category of categories) {
          const snapshot = await getDocs(collection(db, category));
          const categoryItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            category,
            ...doc.data(),
          }));
          items = [...items, ...categoryItems];
        }

        // Save in memory & sessionStorage
        cachedItems = items;
        sessionStorage.setItem("allItems", JSON.stringify(items));

        setAllItems(items);
      } catch (error) {
        console.error("Error fetching all items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  return { allItems, loading };
}
