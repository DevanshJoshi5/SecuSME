import React from "react";
import "../../styles/questionnaire.css";


const AnimatedScore = ({ score }) => {
  return (
    <div className="score-container">
      <h2>Your Risk Score:</h2>
      <div className="score-box">{score}</div>
    </div>
  );
};

export default AnimatedScore;
