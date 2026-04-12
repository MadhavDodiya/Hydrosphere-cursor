import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SellerRoute from "./components/SellerRoute.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddListing from "./pages/AddListing.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";

export default function App() {
  return (
    <div className="min-vh-100">
      <Navbar />
      <main className="pb-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
        </Routes>
      </main>
    </div>
  );
}
