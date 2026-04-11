import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

/** Only sellers can access (e.g. add listing). */
export default function SellerRoute({ children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === "seller" ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}
