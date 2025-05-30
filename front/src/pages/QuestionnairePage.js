import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Questionnaire from "../components/Questionnaire/Questionnaire";
import "../styles/questionnaire.css";

// Pick env var depending on your build tool (Vite/CRA)
const API_BASE_URL = import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL;

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

  const handleQuestionnaireComplete = async (finalScores, questionnaireResponses) => {
    setLoading(true);

    try {
      if (!finalScores || finalScores.questionnaireScore == null) {
        throw new Error("Invalid questionnaire scores");
      }

      setQuestionnaireScores(finalScores);
      setResponses(questionnaireResponses);
      setCompleted(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const payload = {
        session_id: sessionId,
        questionnaire_score: finalScores.questionnaireScore,
        final_score: 0, // ResultsPage will compute this
      };

      const response = await axios.post(`${API_BASE_URL}/api/save_results`, payload, config);
      console.log("Saved questionnaire scores:", response.data);

    } catch (err) {
      console.error("Failed to save questionnaire scores:", err);
      setError("Failed to save questionnaire scores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (completed && !loading && !error) {
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
      {!completed && !loading && !error && (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      )}
    </div>
  );
};

export default QuestionnairePage;
