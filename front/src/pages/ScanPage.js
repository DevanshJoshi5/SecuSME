import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/questionnaire.css";

const ScanPage = () => {
  const navigate = useNavigate();
  const [scanResults, setScanResults] = useState({
    network: null,
    endpoint: null,
    data: null,
  });
  const [scanning, setScanning] = useState(false);

  // ✅ Correctly read the API URL from environment variables
  const apiURL = import.meta.env.VITE_API_URL;

  const performScan = async () => {
    setScanning(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.log("Token has expired, redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const sessionId = "initial_scan"; // Static or dynamic session ID

      const networkRes = await axios.post(
        `${apiURL}/api/scan/network`,
        { session_id: sessionId },
        config
      );

      const endpointRes = await axios.post(
        `${apiURL}/api/scan/endpoint`,
        { session_id: sessionId },
        config
      );

      const dataRes = await axios.post(
        `${apiURL}/api/scan/data`,
        { session_id: sessionId },
        config
      );

      const results = {
        network: networkRes.data.score || 0,
        endpoint: endpointRes.data.endpoint_score || 0,
        data: dataRes.data.score || dataRes.data.data_score || 0,
      };

      setScanResults(results);

      await axios.post(
        `${apiURL}/api/save_results`,
        {
          session_id: sessionId,
          network_score: results.network,
          endpoint_score: results.endpoint,
          data_score: results.data,
        },
        config
      );

      navigate("/questionnaire", {
        state: { sessionId, scanScores: results },
      });
    } catch (error) {
      console.error("Scan failed:", {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
      });
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    performScan();
  }, []);

  return (
    <div className="scan-container">
      <h2>Automated Security Scan</h2>
      {scanning ? (
        <p>Scanning in progress...</p>
      ) : (
        <div className="scan-results">
          <h3>Scan Results</h3>
          <div className="scan-category">
            <h4>Network Scan</h4>
            <p>
              Score: {scanResults.network !== null ? scanResults.network : "Pending"} / 10
            </p>
          </div>
          <div className="scan-category">
            <h4>Endpoint Scan</h4>
            <p>
              Score: {scanResults.endpoint !== null ? scanResults.endpoint : "Pending"} / 10
            </p>
          </div>
          <div className="scan-category">
            <h4>Data Scan</h4>
            <p>
              Score: {scanResults.data !== null ? scanResults.data : "Pending"} / 10
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
