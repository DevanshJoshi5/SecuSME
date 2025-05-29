import React from "react";
import "../../styles/questionnaire.css";

const RiskScore = ({ responses, questionnaireScore, finalRiskScore, riskLevel, questionnaireScores }) => {
  if (!responses || responses.length === 0) {
    return <h2>No responses recorded. Please complete the questionnaire.</h2>;
  }

  // Use pre-calculated category scores from questionnaireScores
  const normalizedNetwork = questionnaireScores?.network || 0;
  const normalizedEndpoint = questionnaireScores?.endpoint || 0;
  const normalizedData = questionnaireScores?.data || 0;

  // Validate finalRiskScore before calling toFixed
  const formattedFinalRiskScore = typeof finalRiskScore === "number" && !isNaN(finalRiskScore)
    ? finalRiskScore.toFixed(2)
    : "N/A";

  return (
    <div className="risk-score-container">
      <h2>Risk Score Results</h2>
      <p><strong>Network Security Risk (Questionnaire):</strong> {normalizedNetwork.toFixed(2)} / 10</p>
      <p><strong>Endpoint Security Risk (Questionnaire):</strong> {normalizedEndpoint.toFixed(2)} / 10</p>
      <p><strong>Data Security Risk (Questionnaire):</strong> {normalizedData.toFixed(2)} / 10</p>
      <h3>Questionnaire Risk Score (Qs): {questionnaireScore?.toFixed(2) || "N/A"} / 10</h3>
      {finalRiskScore !== undefined && riskLevel && (
        <>
          <h3>Final Risk Score: {formattedFinalRiskScore} / 10</h3>
          <p><strong>Risk Level:</strong> {riskLevel}</p>
        </>
      )}
    </div>
  );
};

export default RiskScore;