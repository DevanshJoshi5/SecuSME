import React from "react";
import RiskHeatmap from "../components/Dashboard/RiskHeatmap"; // Adjust path as needed

const DashboardPage = ({ scanScores, questionnaireScores, finalRiskScore, riskLevel }) => {
  return (
    <div className="dashboard">
      <h3>Cybersecurity Risk Dashboard</h3>
      <RiskHeatmap scanScores={scanScores} questionnaireScores={questionnaireScores} />
      <div className="risk-breakdown">
        <h4>Risk Breakdown</h4>
        <p>
          <strong>Network Risk:</strong>{" "}
          {(scanScores?.network || 0).toFixed(2)} / 10 (Scan),{" "}
          {(questionnaireScores?.network || 0).toFixed(2)} / 10 (Questionnaire)
        </p>
        <p>
          <strong>Endpoint Risk:</strong>{" "}
          {(scanScores?.endpoint || 0).toFixed(2)} / 10 (Scan),{" "}
          {(questionnaireScores?.endpoint || 0).toFixed(2)} / 10 (Questionnaire)
        </p>
        <p>
          <strong>Data Risk:</strong>{" "}
          {(scanScores?.data || 0).toFixed(2)} / 10 (Scan),{" "}
          {(questionnaireScores?.data || 0).toFixed(2)} / 10 (Questionnaire)
        </p>
        <p>
          <strong>Final Risk Score:</strong> {finalRiskScore.toFixed(2)} / 10 ({riskLevel})
        </p>
      </div>
      {/* Add mitigation steps and compliance recommendations as needed */}
    </div>
  );
};

export default DashboardPage;