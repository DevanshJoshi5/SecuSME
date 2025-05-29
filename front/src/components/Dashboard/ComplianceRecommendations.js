import React from "react";

const ComplianceRecommendations = ({ riskLevel }) => {
  const recommendations = [];
  if (riskLevel === "High") recommendations.push("Implement GDPR and ISO 27001 compliance policies immediately.");
  if (riskLevel === "Medium") recommendations.push("Review data access controls for GDPR compliance.");

  return (
    <div>
      <h3>Compliance Recommendations</h3>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComplianceRecommendations;