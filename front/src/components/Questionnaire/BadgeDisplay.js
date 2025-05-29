import React from "react";
import "../../styles/questionnaire.css";


const BadgeDisplay = ({ score }) => {
  let badge = "Beginner";
  if (score >= 30) badge = "Intermediate";
  if (score >= 40) badge = "Expert";

  return (
    <div className="badge-container">
      <h3>🏆 Your Badge: {badge}</h3>
    </div>
  );
};

export default BadgeDisplay;
