import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import RiskScore from "../components/Questionnaire/RiskScore";
import DashboardPage from "./DashboardPage";
import BadgeDisplay from "../components/Questionnaire/BadgeDisplay";
import "../styles/questionnaire.css";

const SCORE_WEIGHTS = {
  SCAN_WEIGHT: 0.6,
  QUESTIONNAIRE_WEIGHT: 0.4,
};
const RISK_LEVELS = {
  LOW: { threshold: 3, label: "Low", color: "green" },
  MEDIUM: { threshold: 6, label: "Medium", color: "orange" },
  HIGH: { threshold: Infinity, label: "High", color: "red" },
};

const ResultsPage = () => {
  const location = useLocation();
  const { sessionId, scanScores, responses, questionnaireScores } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef(null);

  console.log("Received scanScores in ResultsPage:", scanScores);
  console.log("Received questionnaireScores in ResultsPage:", questionnaireScores);

  useEffect(() => {
    const saveResults = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const finalRiskScore = Number(
        SCORE_WEIGHTS.SCAN_WEIGHT * scanScore +
        SCORE_WEIGHTS.QUESTIONNAIRE_WEIGHT * questionnaireScore
      );

      try {
        await axios.post(
          "http://localhost:5000/api/save_results",
          {
            session_id: sessionId,
            network_score: scanScores.network,
            endpoint_score: scanScores.endpoint,
            data_score: scanScores.data,
            questionnaire_score: questionnaireScore,
            final_score: finalRiskScore,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Final results saved successfully");
      } catch (err) {
        console.error("Failed to save final results:", err);
      }
    };

    if (scanScores && questionnaireScores) {
      saveResults();
    }
  }, [sessionId, scanScores, questionnaireScores]);

  const scanScore = (() => {
    const { network = 0, endpoint = 0, data = 0 } = scanScores || {};
    const avg = (network + endpoint + data) / 3;
    return Math.max(0, Math.min(avg, 10));
  })();

  const questionnaireScore = (() => {
    const score = questionnaireScores?.questionnaireScore ?? 0;
    return Math.max(0, Math.min(score, 10));
  })();

  const finalRiskScore = Number(
    SCORE_WEIGHTS.SCAN_WEIGHT * scanScore +
    SCORE_WEIGHTS.QUESTIONNAIRE_WEIGHT * questionnaireScore
  );

  const riskLevel = (() => {
    if (isNaN(finalRiskScore)) return RISK_LEVELS.HIGH;
    if (finalRiskScore < RISK_LEVELS.LOW.threshold) return RISK_LEVELS.LOW;
    if (finalRiskScore < RISK_LEVELS.MEDIUM.threshold) return RISK_LEVELS.MEDIUM;
    return RISK_LEVELS.HIGH;
  })();

  const handleExportPDF = () => {
    setExporting(true);
    const input = resultsRef.current;

    // Add a delay to ensure dynamic content (e.g., charts) is rendered
    setTimeout(() => {
      html2canvas(input, {
        scale: 2, // Increase resolution
        useCORS: true, // Allow cross-origin images
        logging: true, // Enable logging to debug issues
        backgroundColor: "#2a3b5a", // Explicitly set the background color
        allowTaint: true, // Allow tainted canvases (e.g., external images)
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add a header
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0); // Black text for readability
        pdf.text("SecuSME Risk Assessment Report", 10, 10);

        // Add the image to the PDF
        pdf.addImage(imgData, "PNG", 0, position + 20, imgWidth, imgHeight); // Offset by 20mm for header
        heightLeft -= pageHeight;

        // Handle multi-page content
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.text("SecuSME Risk Assessment Report", 10, 10);
          pdf.addImage(imgData, "PNG", 0, position + 20, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("SecuSME_Results.pdf");
        setExporting(false);
      }).catch((err) => {
        console.error("Error generating PDF:", err);
        alert("Failed to export results as PDF. Please try again.");
        setExporting(false);
      });
    }, 500); // 500ms delay
  };

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart the assessment? Your current results will be lost.")) {
      window.location.href = "/scan";
    }
  };

  if (!sessionId || !scanScores || !responses || !questionnaireScores) {
    return (
      <div className="results-container">
        <h2>Error: Missing required data. Please complete the scan and questionnaire first.</h2>
        <button onClick={() => window.location.href = "/scan"}>Go to Scan</button>
      </div>
    );
  }

  console.log("Scan Score:", scanScore);
  console.log("Questionnaire Score:", questionnaireScore);
  console.log("Final Risk Score:", finalRiskScore);

  return (
    <div className="results-container" ref={resultsRef}>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.href = "/scan"}>Go to Scan</button>
        </div>
      )}
      {loading ? (
        <p>Loading report...</p>
      ) : (
        <>
          <h2>Final Risk Assessment Report</h2>
          <RiskScore
            responses={responses}
            questionnaireScore={questionnaireScore}
            finalRiskScore={finalRiskScore}
            riskLevel={riskLevel.label}
            questionnaireScores={questionnaireScores}
          />
          <h3>Final Risk Score: {finalRiskScore.toFixed(2)} / 10</h3>
          <p style={{ color: riskLevel.color }}>
            <strong>Risk Level:</strong> {riskLevel.label}
          </p>
          <p><strong>Scan Contribution (60%):</strong> {scanScore.toFixed(2)} / 10</p>
          <p><strong>Questionnaire Contribution (40%):</strong> {questionnaireScore.toFixed(2)} / 10</p>
          <h4>Scan Scores:</h4>
          <p><strong>Network Security Risk (Scan):</strong> {scanScores.network.toFixed(2)} / 10</p>
          <p><strong>Endpoint Security Risk (Scan):</strong> {scanScores.endpoint.toFixed(2)} / 10</p>
          <p><strong>Data Security Risk (Scan):</strong> {scanScores.data.toFixed(2)} / 10</p>
          <BadgeDisplay score={finalRiskScore * 10} />
          <DashboardPage
            scanScores={scanScores}
            questionnaireScores={questionnaireScores}
            finalRiskScore={finalRiskScore}
            riskLevel={riskLevel.label}
          />
<div className="navigation">
  <button onClick={handleRestart}>Restart Assessment</button>
  <button onClick={handleExportPDF} disabled={exporting}>
    {exporting ? "Exporting..." : "Export Results"}
  </button>
  <button
    onClick={() => window.location.href = "/extension-downloads"}
    style={{
      backgroundColor: "#4CAF50",
      color: "white",
      marginLeft: "10px",
      padding: "8px 14px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
    }}
  >
    Download Browser Extension
  </button>
</div>

        </>
      )}
    </div>
  );
};

export default ResultsPage;