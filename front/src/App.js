import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import QuestionnairePage from "./pages/QuestionnairePage";
import ScanPage from "./pages/ScanPage";
import ResultsPage from "./pages/ResultsPage";
import PhishingPage from "./pages/PhishingPage";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ExtensionDownloadsPage from "./pages/ExtensionDownloadsPage";
import Register from "./components/Register";
import { jwtDecode } from "jwt-decode";
import "./App.css";

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ username: decoded.username });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <Router>
      <Navbar />
      <div>
        {user && (
          <div className="logout-container">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          {/* Register Page */}
          <Route path="/register" element={<Register />} />
          {/* Landing Page (post-login) */}
          <Route
            path="/landing"
            element={
              <ProtectedRoute user={user}>
                <>
                  <Hero />
                  <Features />
                  <Testimonials />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          {/* Questionnaire Page */}
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute user={user}>
                <QuestionnairePage />
              </ProtectedRoute>
            }
          />
          {/* Scan Page */}
          <Route
            path="/scan"
            element={
              <ProtectedRoute user={user}>
                <ScanPage />
              </ProtectedRoute>
            }
          />
          {/* Results Page */}
          <Route
            path="/results"
            element={
              <ProtectedRoute user={user}>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          {/* Phishing Page (new protected route) */}
          <Route
            path="/phishing"
            element={
              <ProtectedRoute user={user}>
                <PhishingPage />
              </ProtectedRoute>
            }
          />
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Optional: Add a catch-all route for unmatched routes */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
          <Route path="/extension-downloads" element={<ExtensionDownloadsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;