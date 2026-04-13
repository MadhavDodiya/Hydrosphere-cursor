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

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-vh-100 d-flex flex-column">
      {!isDashboard && <Navbar />}
      <main className="flex-grow-1 pb-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Listing />} />
          <Route path="/listings/:id" element={<Detail />} />
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
