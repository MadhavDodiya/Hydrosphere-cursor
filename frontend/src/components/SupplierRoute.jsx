import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

/** Only suppliers can access (e.g. add listing). */
export default function SupplierRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {user?.role === "supplier" ? children : <Navigate to="/dashboard" replace />}
    </>
  );
}
