import React from "react";
import "../../styles/questionnaire.css";


const Recommendation = ({ score }) => {
  let message = "You need to improve your security measures.";
  if (score >= 30) message = "You're doing well, but there is room for improvement!";
  if (score >= 40) message = "Great job! Your cybersecurity practices are strong.";

  return (
    <div className="recommendation-container">
      <h3>🔍 Recommendation</h3>
      <p>{message}</p>
    </div>
  );
};

export default Recommendation;
