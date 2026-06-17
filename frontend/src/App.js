// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import FlightSearchPage from "./pages/FlightSearchPage";
import FlightResultsPage from "./pages/FlightResultsPage";
import HotelSearchPage from "./pages/HotelSearchPage";
import HotelResultsPage from "./pages/HotelResultsPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flights" element={<FlightSearchPage />} />
        <Route path="/flights/results" element={<FlightResultsPage />} />
        <Route path="/hotels" element={<HotelSearchPage />} />
        <Route path="/hotels/results" element={<HotelResultsPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/booking/:type/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/booking/confirmation/:reference" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#1a1a2e", color: "#fff", borderRadius: "12px" },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;