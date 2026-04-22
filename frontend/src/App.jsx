import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Pricing from "./pages/Pricing.jsx";
import { useAuth } from "./context/AuthContext.jsx";

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
          <Route path="/pricing"       element={<Pricing />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/listings/:id"  element={<Detail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/verify-email"  element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard section="overview" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-listings"
            element={
              <ProtectedRoute>
                <Dashboard section="my-listings" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/leads"
            element={
              <ProtectedRoute>
                <Dashboard section="leads" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inquiries"
            element={
              <ProtectedRoute>
                <Dashboard section="inquiries" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/saved"
            element={
              <ProtectedRoute>
                <Dashboard section="saved" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/billing"
            element={
              <ProtectedRoute>
                <Dashboard section="billing" />
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
