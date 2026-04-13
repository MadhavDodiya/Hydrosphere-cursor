import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SellerRoute from "./components/SellerRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddListing from "./pages/AddListing.jsx";
import Detail from "./pages/Detail.jsx";
import Listing from "./pages/Listing.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/" />;
  return children;
};

export default function App() {
  const location = useLocation();
  // Hide global Navbar on dashboard or admin panels
  const hideNav = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  return (
    <div className="min-vh-100 d-flex flex-column">
      {!hideNav && <Navbar />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/marketplace"   element={<Listing />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/listings/:id"  element={<Detail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <SellerRoute>
                <AddListing />
              </SellerRoute>
            }
          />
          <Route
            path="/add-listing/:id"
            element={
              <SellerRoute>
                <AddListing />
              </SellerRoute>
            }
          />
          <Route path="/admin" element={<AdminRoute><AdminDashboard section="overview" /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminDashboard section="users" /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminDashboard section="listings" /></AdminRoute>} />
          <Route path="/admin/verify" element={<AdminRoute><AdminDashboard section="verify" /></AdminRoute>} />
          <Route path="/admin/inquiries" element={<AdminRoute><AdminDashboard section="inquiries" /></AdminRoute>} />
          <Route path="/admin/contacts" element={<AdminRoute><AdminDashboard section="contacts" /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminDashboard section="analytics" /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}
