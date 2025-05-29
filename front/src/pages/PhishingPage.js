import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GmailConnect from "../components/GmailConnect";
import "../styles/questionnaire.css";

const PhishingPage = () => {
  const [phishingContent, setPhishingContent] = useState("");
  const [phishingScore, setPhishingScore] = useState(0);
  const [phishingDetails, setPhishingDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("url"); // "url" or "email"

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePhishingScan = async () => {
    setLoading(true);
    setError(null);
    setPhishingDetails({});
    setPhishingScore(0);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to scan for phishing.");
      setLoading(false);
      return;
    }

    if (!phishingContent || !phishingContent.match(/^https?:\/\//)) {
      setError("Please enter a valid URL starting with http:// or https://");
      setLoading(false);
      return;
    }

    try {
      const API_KEY = process.env.REACT_APP_SAFE_BROWSING_API_KEY;
      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
        {
          client: { clientId: "secusme", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: phishingContent }],
          },
        }
      );

      const isPhishy = response.data.matches && response.data.matches.length > 0;
      const score = isPhishy ? 8 : 0;

      setPhishingScore(score);
      setPhishingDetails({
        is_phishy: isPhishy,
        content: phishingContent,
        threatTypes: isPhishy
          ? response.data.matches.map((m) => m.threatType).join(", ")
          : "None",
      });
    } catch (err) {
      console.error("Phishing scan failed:", err);
      setError(
        `Failed to scan for phishing: ${err.message}. Check API key or try again later.`
      );
      setPhishingScore(0);
      setPhishingDetails({});
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/landing");
  };

  return (
    <div className="results-container">
      <h2>Phishing Detection</h2>

      <div className="tab-buttons">
        <button
          className={tab === "url" ? "active-tab" : ""}
          onClick={() => setTab("url")}
        >
          URL Scanner
        </button>
        <button
          className={tab === "email" ? "active-tab" : ""}
          onClick={() => setTab("email")}
        >
          Gmail Email Scanner
        </button>
      </div>

      {tab === "url" && (
        <>
          {error && <p className="error-message">{error}</p>}
          <textarea
            value={phishingContent}
            onChange={(e) => setPhishingContent(e.target.value)}
            placeholder="Enter URL to scan for phishing (e.g., http://fakebank.xyz)"
            rows="4"
            cols="50"
          />
          <button onClick={handlePhishingScan} disabled={loading}>
            {loading ? "Scanning..." : "Scan for Phishing"}
          </button>

          {phishingDetails.content && !error && (
            <div className="phishing-result">
              <p>
                <strong>Phishing Score:</strong> {phishingScore.toFixed(2)} / 10
              </p>
              {phishingDetails.is_phishy ? (
                <p style={{ color: "red" }}>
                  ⚠️ Warning: Potential phishing URL detected!
                </p>
              ) : (
                <p style={{ color: "green" }}>
                  ✅ This URL appears to be safe.
                </p>
              )}
              <p>
                <strong>Threat Types:</strong> {phishingDetails.threatTypes}
              </p>
              <p>
                <strong>Scanned URL:</strong> {phishingDetails.content}
              </p>
            </div>
          )}
        </>
      )}

      {tab === "email" && (
        <div style={{ marginTop: "1rem" }}>
          <GmailConnect />
        </div>
      )}

      <button onClick={handleBack} style={{ marginTop: "1rem" }}>
        Back to Home
      </button>
    </div>
  );
};

export default PhishingPage;
