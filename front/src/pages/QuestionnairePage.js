import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Questionnaire from "../components/Questionnaire/Questionnaire";
import "../styles/questionnaire.css";

const QuestionnairePage = () => {
  const [completed, setCompleted] = useState(false);
  const [questionnaireScores, setQuestionnaireScores] = useState({
    network: 0,
    endpoint: 0,
    data: 0,
    questionnaireScore: 0,
  });
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId = "initial_scan", scanScores } = location.state || {};

  const handleQuestionnaireComplete = (finalScores, questionnaireResponses) => {
    setLoading(true);
    try {
      if (
        !finalScores ||
        finalScores.questionnaireScore === undefined ||
        finalScores.questionnaireScore === null
      ) {
        throw new Error("Invalid questionnaire scores");
      }
      console.log("Received Questionnaire Scores in QuestionnairePage:", finalScores);
      setQuestionnaireScores(finalScores); // Includes network, endpoint, data, questionnaireScore
      setResponses(questionnaireResponses);
      setCompleted(true);
      setError(null);

      // Save questionnaire scores to backend
      const token = localStorage.getItem("token");
      console.log("Token for save_results:", token);
      if (token) {
        axios
          .post(
            "http://localhost:5000/api/save_results",
            {
              session_id: sessionId,
              questionnaire_score: finalScores.questionnaireScore,
              final_score: 0, // Will be calculated in ResultsPage
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            console.log("Questionnaire scores saved:", response.data);
          })
          .catch((err) => {
            console.error("Failed to save questionnaire scores:", err);
            setError("Failed to save questionnaire scores. Please try again.");
          });
      } else {
        console.log("No token found for saving questionnaire scores");
        setError("Authentication error. Please log in again.");
      }
    } catch (err) {
      console.error("Questionnaire Error:", err.message);
      setError("Failed to complete questionnaire. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically navigate to ResultsPage after questionnaire is completed
  useEffect(() => {
    if (completed && !loading && !error) {
      console.log("Navigating to ResultsPage with:", {
        sessionId,
        scanScores,
        responses,
        questionnaireScores,
      });
      navigate("/results", {
        state: { sessionId, scanScores, responses, questionnaireScores },
      });
    }
  }, [completed, loading, error, navigate, sessionId, scanScores, responses, questionnaireScores]);

  const handleReset = () => {
    setCompleted(false);
    setQuestionnaireScores({ network: 0, endpoint: 0, data: 0, questionnaireScore: 0 });
    setResponses([]);
    setError(null);
  };

  return (
    <div className="questionnaire-container">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleReset}>Retry</button>
          <button onClick={() => navigate("/scan")}>Go to Scan</button>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {!completed && !loading && !error ? (
        <Questionnaire
          onComplete={(finalScores, responses) =>
            handleQuestionnaireComplete(finalScores, responses)
          }
        />
      ) : null}
    </div>
  );
};

export default QuestionnairePage;