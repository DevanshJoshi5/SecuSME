// src/components/Questionnaire.js
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../styles/questionnaire.css";

const QUESTIONS = [
  { id: 1, text: "network_firewall", category: "network", importance: "very important" },
  { id: 2, text: "network_encryption", category: "network", importance: "important" },
  { id: 3, text: "network_intrusion_detection", category: "network", importance: "important" },
  { id: 4, text: "network_closed_ports", category: "network", importance: "very important" },
  { id: 5, text: "network_vpn", category: "network", importance: "important" },
  { id: 6, text: "network_segmentation", category: "network", importance: "less important" },
  { id: 7, text: "network_log_monitoring", category: "network", importance: "important" },
  { id: 8, text: "endpoint_antivirus", category: "endpoint", importance: "important" },
  { id: 9, text: "endpoint_updates", category: "endpoint", importance: "very important" },
  { id: 10, text: "endpoint_edr", category: "endpoint", importance: "important" },
  { id: 11, text: "endpoint_password_protection", category: "endpoint", importance: "important" },
  { id: 12, text: "endpoint_disabled_services", category: "endpoint", importance: "less important" },
  { id: 13, text: "endpoint_remote_desktop", category: "endpoint", importance: "less important" },
  { id: 14, text: "endpoint_mfa", category: "endpoint", importance: "important" },
  { id: 15, text: "data_encryption_at_rest", category: "data", importance: "very important" },
  { id: 16, text: "data_backup_strategy", category: "data", importance: "important" },
  { id: 17, text: "data_access_controls", category: "data", importance: "very important" },
  { id: 18, text: "data_log_auditing", category: "data", importance: "important" },
  { id: 19, text: "data_encryption_in_transit", category: "data", importance: "important" },
  { id: 20, text: "data_retention_policy", category: "data", importance: "less important" },
];

const RISK_POINTS = {
  "very important": 3,
  "important": 2,
  "less important": 1,
};

const Questionnaire = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleAnswer = (answer) => {
    const newResponses = [...responses, { questionId: QUESTIONS[currentQuestionIndex].id, answer }];
    setResponses(newResponses);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate scores
      const scores = { network: 0, endpoint: 0, data: 0 };
      const maxScores = { network: 0, endpoint: 0, data: 0 };

      // Calculate maximum possible scores for each category
      QUESTIONS.forEach((question) => {
        const category = question.category;
        maxScores[category] += RISK_POINTS[question.importance];
      });

      // Calculate actual scores based on responses
      newResponses.forEach((response, index) => {
        const question = QUESTIONS[index];
        const category = question.category;
        if (response.answer === "No") {
          scores[category] += RISK_POINTS[question.importance]; // Add points based on importance
        }
      });

      // Normalize scores to 0-10 scale
      scores.network = maxScores.network ? (scores.network / maxScores.network) * 10 : 0;
      scores.endpoint = maxScores.endpoint ? (scores.endpoint / maxScores.endpoint) * 10 : 0;
      scores.data = maxScores.data ? (scores.data / maxScores.data) * 10 : 0;

      // Overall questionnaire score (average of category scores)
      const questionnaireScore = (scores.network + scores.endpoint + scores.data) / 3;

      console.log("Calculated Questionnaire Scores:", {
        network: scores.network,
        endpoint: scores.endpoint,
        data: scores.data,
        questionnaireScore,
      });
      console.log("Maximum Possible Scores:", maxScores);

      onComplete({ network: scores.network, endpoint: scores.endpoint, data: scores.data, questionnaireScore }, newResponses);
    }
  };

  return (
    <div className="questionnaire">
      <h2>{t('questionnaire.welcome')}</h2>
      <p>{t('questionnaire.instructions')}</p>
      <p>{t(`questionnaire.questions.${QUESTIONS[currentQuestionIndex].text}`)}</p>
      <div className="options">
        <button onClick={() => handleAnswer("Yes")}>{t('yes')}</button>
        <button onClick={() => handleAnswer("No")}>{t('no')}</button>
      </div>
    </div>
  );
};

export default Questionnaire;