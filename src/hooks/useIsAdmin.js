// src/hooks/useIsAdmin.js
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ✅ Put your two admin UIDs here (from Firebase Console → Authentication)
const ADMIN_UIDS = new Set([
  "2PIxbZTAYrR0JzV36IctzViNqSu1",
  "ei1Tozg7TgMfp5RTGpzzptGn0cX2",
]);

export default function useIsAdmin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser(u);

      // 1) UID-based check (fast, no claims needed)
      if (ADMIN_UIDS.has(u.uid)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // 2) Optional fallback: custom claim { admin: true } if you use it later
      try {
        const tokenRes = await u.getIdTokenResult(); // no force refresh needed here
        setIsAdmin(tokenRes.claims?.admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { user, isAdmin, loading };
}
