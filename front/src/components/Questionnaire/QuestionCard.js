import React from "react";
import "../../styles/questionnaire.css";

const QuestionCard = ({ question, onAnswer }) => {
    return (
        <div className="question-box">
            <p>{question.text}</p>
            <button onClick={() => onAnswer(0)}>Yes</button>  {/* ✅ Secure Answer */}
            <button onClick={() => onAnswer(2)}>No</button>   {/* ⚠️ Risk Detected */}
        </div>
    );
};

export default QuestionCard;
