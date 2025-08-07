import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

const PrivateRoute = ({ children, fetchCategories }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthorized(true);
        if (fetchCategories) fetchCategories(); // Call fetchCategories if passed
      } else {
        navigate("/admin-login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, fetchCategories]);

  if (loading) return <div>Loading...</div>;

  return isAuthorized ? children : null;
};

export default PrivateRoute;
